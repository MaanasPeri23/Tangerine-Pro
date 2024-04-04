//
//  ContentView.swift
//  ProjectTangerine
//
//  Created by Maanas Peri on 3/17/24.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = SpeechRecognitionViewModel()
    
    var body: some View {
        VStack {
            if viewModel.isAvailable {
                Text(viewModel.transcribedText)
                    .padding()
                
                Spacer()
                
                Button(action: startOrStopRecording) {
                    Text(viewModel.isRecording ? "Stop Recording" : "Start Recording")
                        .foregroundColor(.white)
                        .padding()
                        .background(viewModel.isRecording ? Color.red : Color.green)
                        .cornerRadius(10)
                }
            } else {
                Text(viewModel.errorMessage)
                    .foregroundColor(.red)
                    .padding()
            }
        }
        .padding()
    }
    
    private func startOrStopRecording() {
        if viewModel.isRecording {
            viewModel.stopRecording()
        } else {
            viewModel.startRecording()
        }
    }
}

#Preview {
    ContentView()
}
