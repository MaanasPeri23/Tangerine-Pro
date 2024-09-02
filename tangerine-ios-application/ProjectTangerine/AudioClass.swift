//
//  AudioClass.swift
//  ProjectTangerine
//
//  Created by Maanas Peri on 3/17/24.
//

//
//  AudioClass.swift
//  ProjectTangerine
//
//  Created by Maanas Peri on 3/17/24.
//

import Foundation
import AVFoundation
import Speech
import SwiftUI
import Starscream

class SpeechRecognitionViewModel: NSObject, ObservableObject {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))!
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private var socket: WebSocket!
    
    @Published var transcribedText: String = ""
    @Published var isRecording: Bool = false
    @Published var isAvailable: Bool = false
    @Published var errorMessage: String = ""
    
    private var sessionFolderTxt: String?
    
    
    override init() {
        super.init()
        speechRecognizer.delegate = self
        setupSpeechRecognizer()
        setUpWebSocket()
    }
    
    private func setUpWebSocket(){
        let urlString = "ws://localhost:8080"
        guard let url = URL(string: urlString) else {
            fatalError("URL is not valid")
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = 5
        socket = WebSocket(request: request)
        socket.delegate = self
        socket.connect()
    }
    
    private func setupSpeechRecognizer() {
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                self?.handleAuthorizationStatus(authStatus)
            }
        }
    }
    
    private func handleAuthorizationStatus(_ authStatus: SFSpeechRecognizerAuthorizationStatus) {
        switch authStatus {
        case .authorized:
            isAvailable = true
        case .denied:
            isAvailable = false
            errorMessage = "User denied access to speech recognition"
        case .restricted:
            isAvailable = false
            errorMessage = "Speech recognition restricted on this device"
        case .notDetermined:
            isAvailable = false
            errorMessage = "Speech recognition not yet authorized"
        default:
            isAvailable = false
        }
    }
    
    func startRecording() {
        isRecording = true
        transcribedText = ""
        
        // Cancel any previous recognition task
        if let recognitionTask = recognitionTask {
            recognitionTask.cancel()
            self.recognitionTask = nil
        }
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            
            //Configure Audio to the .record and .measurement category for accurate audio recording
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            let inputNode = audioEngine.inputNode
            
            // Preparing recognition request
            recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let recognitionRequest = recognitionRequest else {
                fatalError("Unable to create a SFSpeechAudioBufferRecognitionRequest object")
            }
            
            // Connecting to websocket socket server ws://localhost:8080
            
            
            
            recognitionRequest.shouldReportPartialResults = true
            
            if #available(iOS 13, *) {
                recognitionRequest.requiresOnDeviceRecognition = true
            }
            
            //starting new session through websocket before starting recognition task
            let startSessionMessage = ["action": "start_session"]
            //converting to JSON first
            if let startSessionData = try? JSONSerialization.data(withJSONObject: startSessionMessage, options: []){
                //converting json serialization to string now
                if let startSessionString = String(data: startSessionData, encoding: .utf8){
                    self.socket.write(string: startSessionString)
                }
            }
         
            // Start the audio-to-text process with audio buffer loaded in recognitionRequest
            // This function was a bit too long too show, collapsed it for now but attached this to Appendix for later:)
            recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
                guard let self = self else { return }
                var isFinal = false
                
                // If there is a valid result from the result of firing off the recognitionRequest to recognitionTask
                if let result = result {
                    self.transcribedText = result.bestTranscription.formattedString
                    isFinal = result.isFinal

                    // Create a dictionary with transcribed text
                    let message: [String: Any] = ["folder": self.sessionFolderTxt ?? "", "text": self.transcribedText]

                    // Convert the dictionary to JSON data
                    if let jsonData = try? JSONSerialization.data(withJSONObject: message, options: []) {
                        // Convert the JSON data to a string
                        if let jsonString = String(data: jsonData, encoding: .utf8) {
                            // Send string over WebSocket
                            print(jsonString)
                            self.socket.write(string: jsonString)
                        }
                    }
                }
                // Invokes this function and clears the recognitionRequest once user clicks 'Stop Recording' button
                if error != nil || isFinal {
                    self.stopRecording()
                }
            }
            
            
            // Installing 'Tap' on the input node (microphone) to recieve each buffer of audio
            // Microphone channel analogy
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
                self.recognitionRequest?.append(buffer)
            }
            
            // After setting up these variables and function, we can now start the audio engine until this do-catch method exits
            audioEngine.prepare()
            try audioEngine.start()
            
        } catch {
            stopRecording()
            errorMessage = "Recording Not Available: \(error.localizedDescription)"
        }
    }
    
    func stopRecording() {
        isRecording = false
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
    }
}

extension SpeechRecognitionViewModel: WebSocketDelegate {
    func didReceive(event: Starscream.WebSocketEvent, client: any Starscream.WebSocketClient) {
        switch event {
        case .connected(let headers):
            print("Swift WebSocket connected:", headers)
        case .disconnected(let reason, let code):
            print("Swift WebSocket disconnected:", reason, code)
        case .text(let string):
            
            //if the string is a valid text when using utf8 and set to data, then serialize data to json object. it is a dictionary, so string: Any type works best.
            if let data = string.data(using: .utf8), let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String? : Any] {
                
                //checking if message is a session_folder message
                if let action = json["action"] as? String, action == "session_folder" {
                    self.sessionFolderTxt = json["folder"] as? String
                    print("Session Folder And Text recieved: ", self.sessionFolderTxt ?? "No folder name")
                }
            }
            
            
            print("Swift Client received message from server:", string)
            // Handle any incoming messages from the server if needed
        case .binary(let data):
            print("Swift Received binary data:", data)
        case .ping(_):
            break
        case .pong(_):
            break
        case .viabilityChanged(_):
            break
        case .reconnectSuggested(_):
            break
        case .cancelled:
            break
        case .error(let error):
            print("WebSocket error:", error ?? "Unknown")
        case .peerClosed:
            break
        }
    }
}

extension SpeechRecognitionViewModel: SFSpeechRecognizerDelegate {
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        isAvailable = available
    }
}

