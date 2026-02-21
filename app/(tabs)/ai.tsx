import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TAB_BAR_BASE_HEIGHT } from "@/utils/config";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp?: Date;
  type?: "text" | "document";
  fileName?: string;
}

const GENERATE_COMMAND = "GENERATE_FILE_COMMAND:";

export default function ai() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingDoc, setProcessingDoc] = useState(false);
  const [pendingDocumentContent, setPendingDocumentContent] = useState<
    string | null
  >(null);
  const [pendingDocumentName, setPendingDocumentName] = useState<string | null>(
    null
  );

  const flatListRef = useRef<FlatList>(null);

  // ⚠️ NOTE: Replace this with your actual, secure API Key
  const GEMINI_API_KEY = "AIzaSyDNQMuQFGeA1DS8zAwkwXMw58mrYOFtEqQ";
  const GEMINI_FLASH_MODEL = "gemini-2.5-flash";

  const stripMarkdown = (text: string): string => {
    // Basic Markdown stripping for clean display in a simple Text component

    let strippedText = text;

    // 1. Remove Bolding/Italics/Underlines/Code Blocks
    strippedText = strippedText
      .replace(/\*\*(.*?)\*\*/g, "$1") // Removes **bolding**
      .replace(/\*(.*?)\*/g, "$1") // Removes *italics*
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/```.*?```/gs, ""); // Removes multiline code blocks

    // 2. Remove Headers, Links, and List markers
    strippedText = strippedText
      .replace(/#{1,6}\s/g, "") // Removes # headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Removes [links](...)
      .replace(/^\s*[-*+]\s/gm, "") // Removes bullet points
      .replace(/^\s*\d+\.\s/gm, ""); // Removes numbered lists

    // 3. FINAL CATCH: Aggressively remove any leftover asterisks or underscores
    strippedText = strippedText.replace(/[\*_]/g, "");

    return strippedText.trim();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (chat.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat]);

  // --- Document Extraction Functions (No change) ---

  const extractTextFromTXT = async (fileUri: string): Promise<string> => {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri);
      return content;
    } catch (error) {
      throw new Error("Failed to read text file");
    }
  };

  const callGeminiExtraction = async (
    base64Data: string,
    mimeType: string,
    prompt: string
  ) => {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FLASH_MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8000,
        },
      },
      {
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not extract content"
    );
  };

  const extractTextFromPDF = async (
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const extractedText = await callGeminiExtraction(
        base64Data,
        "application/pdf",
        "Please read this PDF document and extract ALL the text content. Return the complete text in a clear, readable format with proper paragraphs and sections."
      );
      return `PDF Document: ${fileName}\n\nExtracted Content:\n${extractedText}`;
    } catch (error: any) {
      throw new Error(
        `Failed to extract text from PDF: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  };

  const extractTextFromWord = async (
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mimeType = fileName.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/msword";
      const extractedText = await callGeminiExtraction(
        base64Data,
        mimeType,
        "Please read this Word document and extract ALL the text content. Return the complete text with proper formatting, paragraphs, and sections."
      );
      return `Word Document: ${fileName}\n\nExtracted Content:\n${extractedText}`;
    } catch (error: any) {
      throw new Error(
        `Failed to extract text from Word document: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  };

  const extractTextFromExcel = async (
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mimeType = fileName.endsWith(".xlsx")
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/vnd.ms-excel";
      const extractedText = await callGeminiExtraction(
        base64Data,
        mimeType,
        "Please read this Excel spreadsheet and extract ALL the data. Include all sheets, columns, rows, and cell values. Format the data clearly as tables."
      );
      return `Excel Spreadsheet: ${fileName}\n\nExtracted Data:\n${extractedText}`;
    } catch (error: any) {
      throw new Error(
        `Failed to extract data from Excel file: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  };

  const extractTextFromImage = async (
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const extension = fileName.split(".").pop()?.toLowerCase() || "jpeg";
      const mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;

      const extractedText = await callGeminiExtraction(
        base64Data,
        mimeType,
        "Please analyze this image and extract ALL visible text. If there's text, transcribe it completely. If there's no text, describe what you see in detail."
      );
      return `Image: ${fileName}\n\nExtracted Content:\n${extractedText}`;
    } catch (error: any) {
      throw new Error(
        `Failed to extract text from image: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  };

  // --- Document Processing (Placeholder fix applied) ---
  const processDocument = async (file: any) => {
    // Clear previous state before starting
    setPendingDocumentContent(null);
    setPendingDocumentName(null);

    // UX: Set loading states
    setProcessingDoc(true);
    setLoading(true);

    try {
      // 1. UX: Show "Processing..." user message immediately
      const processingMessage: ChatMessage = {
        sender: "user",
        text: `📄 Processing ${file.name}...`, // Added "Processing" back for clarity
        timestamp: new Date(),
        type: "document",
        fileName: file.name,
      };
      setChat((prev) => [...prev, processingMessage]);

      let extractedContent = "";
      const fileExtension = file.name?.split(".").pop()?.toLowerCase() || "";
      const mimeType = file.mimeType || "";

      // Route to appropriate extraction function (Multimodal API call)
      if (fileExtension === "txt" || mimeType.includes("text/plain")) {
        const textContent = await extractTextFromTXT(file.uri);
        extractedContent = `Text Document: ${file.name}\n\nContent:\n${textContent}`;
      } else if (fileExtension === "pdf" || mimeType.includes("pdf")) {
        extractedContent = await extractTextFromPDF(file.uri, file.name);
      } else if (
        fileExtension === "doc" ||
        fileExtension === "docx" ||
        mimeType.includes("word")
      ) {
        extractedContent = await extractTextFromWord(file.uri, file.name);
      } else if (
        fileExtension === "xls" ||
        fileExtension === "xlsx" ||
        mimeType.includes("excel") ||
        mimeType.includes("spreadsheet")
      ) {
        extractedContent = await extractTextFromExcel(file.uri, file.name);
      } else if (
        fileExtension === "jpg" ||
        fileExtension === "jpeg" ||
        fileExtension === "png" ||
        fileExtension === "gif" ||
        fileExtension === "webp" ||
        mimeType.includes("image")
      ) {
        extractedContent = await extractTextFromImage(file.uri, file.name);
      } else {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        const fileSize = fileInfo.size
          ? `${Math.round(fileInfo.size / 1024)} KB`
          : "Unknown size";
        extractedContent = `File: ${
          file.name
        }\nType: ${fileExtension.toUpperCase()}\nSize: ${fileSize}\n\nUnsupported file type. Please try a text, PDF, Word, Excel, or image file.`;
      }

      // 2. UX: REPLACE the user's "Processing" message with a concise "Success" user message (CONFIRMATION)
      const userSuccessContent = `✅ Document ${fileExtension.toUpperCase()} loaded!`;

      setChat((prev) => {
        const newChat = [...prev];
        // Find the index of the "Processing" message by looking for the full text
        const processingIndex = newChat.findIndex((msg) =>
          msg.text.includes(`📄 Processing ${file.name}...`)
        );

        if (processingIndex !== -1) {
          newChat[processingIndex] = {
            sender: "user",
            text: userSuccessContent,
            timestamp: new Date(),
            type: "document",
            fileName: file.name,
          };
        } else {
          // Fallback: Add success message if processing message wasn't found
          newChat.push({
            sender: "user",
            text: userSuccessContent,
            timestamp: new Date(),
            type: "document",
            fileName: file.name,
          });
        }
        return newChat;
      });

      // 3. UX: ADD a definitive AI message instructing the user
      const aiReadyMessage: ChatMessage = {
        sender: "ai",
        text: `All set! I’ve loaded **${file.name}**. What would you like me to do? summarize, extract key points, rewrite, or answer questions?`,
        timestamp: new Date(),
      };
      setChat((prev) => [...prev, aiReadyMessage]);

      // Set the extracted content and name for the next user input
      setPendingDocumentContent(extractedContent);
      setPendingDocumentName(file.name);
    } catch (error: any) {
      console.error("Document processing error:", error);
      setChat((prev) => {
        const newChat = [...prev];
        // Replace the "Processing..." message with the error message
        newChat[newChat.length - 1] = {
          sender: "user",
          text: `❌ Error processing: ${file.name}\n\n${error.message}\n\nPlease try again or try a different file.`,
          timestamp: new Date(),
          type: "document",
          fileName: file.name,
        };
        return newChat;
      });
    } finally {
      setProcessingDoc(false);
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    if (loading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/plain",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        await processDocument(result.assets[0]);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to pick document: " + error.message);
    }
  };

  // --- File Generation Logic (No change) ---
  const generateAndDownloadFile = async (content: string) => {
    if (!content.startsWith(GENERATE_COMMAND)) return;

    const fileContent = content.substring(GENERATE_COMMAND.length).trim();
    // Defaulting to .txt as it handles all text output from Gemini cleanly
    const fileName = `Generated_Report_${new Date().getTime()}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    try {
      // 1. Write file locally
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 2. UX: Add AI success message
      const aiMessage: ChatMessage = {
        sender: "ai",
        text: `File **${fileName}** file created! `,
        timestamp: new Date(),
      };
      setChat((prev) => [...prev, aiMessage]);

      // 3. Open native share/save dialog
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "File sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Share or Save ${fileName}`,
        mimeType: "text/plain",
      });
    } catch (error: any) {
      console.error("File generation/sharing error:", error);
      Alert.alert(
        "Error",
        `Failed to generate or share file: ${error.message}`
      );
    }
  };

  const sendToAI = async (content: string) => {
    let rawReply: string = "";

    // 1. Check if the original user message triggered the file generation system prompt
    const wasGenerateRequest = content.includes(
      "SYSTEM INSTRUCTION: You are acting as a file generation module"
    );

    try {
      const recentChat = chat.slice(-6);

      const contents = recentChat
        .filter((c) => c.type !== "document" || c.sender === "ai")
        .map((c) => ({
          role: c.sender === "user" ? "user" : "model",
          parts: [{ text: c.text }],
        }));

      contents.push({
        role: "user",
        parts: [{ text: content }],
      });

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FLASH_MODEL}:generateContent`,
        {
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        },
        {
          headers: {
            "x-goog-api-key": GEMINI_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      rawReply =
        response.data.candidates[0]?.content?.parts[0]?.text ||
        "I couldn't generate a response. Please try again.";

      // 2. CHECK 1: The ideal scenario (AI followed the instruction strictly)
      if (rawReply.startsWith(GENERATE_COMMAND)) {
        await generateAndDownloadFile(rawReply);
        return;
      }

      // 3. CHECK 2: The fallback scenario (AI was conversational but should generate a file)
      if (wasGenerateRequest && rawReply.trim().length > 100) {
        // If it was a file request AND the reply is substantial (not just "I can't"), force the command.
        const forcedReply = `${GENERATE_COMMAND}${rawReply}`;
        await generateAndDownloadFile(forcedReply);
        return;
      }

      // 4. Default: It was a regular chat or the AI gave a short error/disclaimer.
      const cleanReply = stripMarkdown(rawReply);

      const aiMessage: ChatMessage = {
        sender: "ai",
        text: cleanReply,
        timestamp: new Date(),
      };

      setChat((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error);
      const errorMessage: ChatMessage = {
        sender: "ai",
        text: `API Error: ${
          error.response?.data?.error?.message ||
          "Please check your API Key and network connection."
        }`,
        timestamp: new Date(),
      };
      setChat((prev) => [...prev, errorMessage]);
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    const isDocumentMessage = !!pendingDocumentContent;
    const isGenerateRequest =
      trimmedMessage.toLowerCase().includes("generate") ||
      trimmedMessage.toLowerCase().includes("create file") ||
      trimmedMessage.toLowerCase().includes("output file");

    if (!trimmedMessage || loading) return;

    let finalUserPrompt = trimmedMessage;

    if (isDocumentMessage && pendingDocumentContent && pendingDocumentName) {
      // Prompt for Document Analysis (Passes the file content to AI)
      finalUserPrompt = `
        **DOCUMENT DATA START**
        File Name: ${pendingDocumentName}
        Extracted Content:
        ${pendingDocumentContent}
        **DOCUMENT DATA END**

        **USER REQUEST:**
        Please use the DOCUMENT DATA provided above to respond to the following instruction: "${trimmedMessage}"
        Do not repeat or quote the entire DOCUMENT DATA unless specifically requested. Focus only on answering the user's specific request.
      `;
    } else if (isGenerateRequest) {
      // Strict structure for file generation (Marketing Strategist Requirement)
      finalUserPrompt = `
        SYSTEM INSTRUCTION: You are acting as a file generation module for a freelance marketing strategist. Your goal is to generate high-quality text assets (e.g., outlines, email drafts, SOWs) based on the user's request. Your output MUST be wrapped in a special command for the application to handle.
        
        USER REQUEST: "${trimmedMessage}"
        
        TASK: Fulfill the user request by generating the content (e.g., a report, a proposal, a detailed plan). Do not add any conversational text, greetings, or explanations.
        
        REQUIRED OUTPUT FORMAT: You MUST begin your response with the exact text "${GENERATE_COMMAND}" followed immediately by the complete generated text content.
        
        Example: ${GENERATE_COMMAND}This is the generated report content.
      `;
    }

    // UX: Show the user's message immediately
    const userMessage: ChatMessage = {
      sender: "user",
      text: isDocumentMessage
        ? `Regarding file ${pendingDocumentName}: ${trimmedMessage}`
        : trimmedMessage,
      timestamp: new Date(),
      type: isDocumentMessage ? "document" : "text",
      fileName: pendingDocumentName || undefined,
    };

    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    await sendToAI(finalUserPrompt);

    // Clear the pending content after it has been sent to the AI
    if (isDocumentMessage) {
      setPendingDocumentContent(null);
      setPendingDocumentName(null);
    }

    setLoading(false);
  };

  // --- Rendering Functions (No change) ---

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isUser = item.sender === "user";
    const isDocument = item.type === "document";
    const time = item.timestamp ? formatTime(item.timestamp) : "";

    return (
      <View
        className={`mb-4 ${isUser ? "items-end" : "items-start"}`}
        key={index}
      >
        <View
          className={`flex-row items-end max-w-[85%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {!isUser && (
            <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-2">
              <Ionicons name="sparkles" size={16} color="white" />
            </View>
          )}

          <View
            className={`rounded-2xl px-4 py-3 ${
              isUser ? "bg-[#93c5fd]" : "bg-[#F3F4F6]"
            }`}
          >
            <Text
              className={`text-xs font-semibold mb-1 ${
                isUser ? "text-[#202A38]" : "text-gray-600"
              }`}
            >
              {isUser ? "You" : "AI Assistant"}
            </Text>

            {isDocument && isUser && item.fileName && (
              <View className="bg-white/20 rounded-lg px-3 py-2 mb-2">
                <Text className="text-white text-xs">📄 {item.fileName}</Text>
              </View>
            )}

            <Text className={`${isUser ? "text-[#202A38]" : "text-gray-800"}`}>
              {item.text}
            </Text>

            <Text
              className={`text-[10px] mt-1 ${
                isUser ? "text-[#202A38]" : "text-gray-500"
              }`}
            >
              {time}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View className="mb-4 items-start">
      <View className="flex-row items-end max-w-[85%]">
        <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-2">
          <Ionicons name="sparkles" size={16} color="white" />
        </View>

        <View className="rounded-2xl px-4 py-3 bg-gray-200">
          <Text className="text-xs font-semibold mb-1 text-gray-600">
            AI Assistant
          </Text>
          {processingDoc ? (
            <>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-gray-800 mt-2">
                Reading document content...
              </Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-gray-800 mt-2">Thinking...</Text>
            </>
          )}
          <Text className="text-[10px] mt-1 text-gray-500">
            {formatTime(new Date())}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-2xl font-semiBold text-center mb-3 text-gray-800">
        Smart Document Assistant
      </Text>

      <Text className="text-base font-regular text-center text-gray-600 leading-6 px-4 mb-8">
        Upload files or type your text. I'll help you analyze, summarize, and
        get work done faster.
      </Text>
    </View>
  );

  // --- Main Component Render ---
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg font-semiBold">AI Chat</Text>

        <TouchableOpacity
          onPress={() => chat.length > 0 && setChat([])}
          className="p-2"
          disabled={chat.length === 0}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={chat.length > 0 ? "#ef4444" : "#d1d5db"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={chat}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `message-${index}-${item.timestamp}`}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20 + TAB_BAR_BASE_HEIGHT + (insets.bottom ?? 0),
        }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={loading ? renderTypingIndicator() : null}
      />

      {/* UX/UI: Input Bar (Dynamically controlled) */}
      <View className="px-4 py-3 border-t border-gray-200">
        <View className="flex-row items-center  space-x-2">
          <View className="bg-whites w-[90%] flex-row items-center ">
            <TouchableOpacity
              onPress={pickDocument}
              className="w-10 h-10 items-center justify-center"
              disabled={loading}
            >
              <Ionicons name="attach" size={24} color="#3b82f6" />
            </TouchableOpacity>

            <TextInput
              className="flex-1 rounded-full  py-3"
              placeholder={
                loading
                  ? processingDoc
                    ? "Reading document content..."
                    : "AI Assistant is thinking..."
                  : pendingDocumentContent
                  ? `Ask about ${pendingDocumentName}: Summarize, analyze, or generate content...`
                  : "How can I help with your project today?"
              }
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={sendMessage}
              editable={!loading} // Disable while loading
              multiline
              numberOfLines={1}
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor:
                loading || !message.trim() ? "#93c5fd" : "#3b82f6", // Grey-blue when disabled
            }}
            disabled={loading || !message.trim()} // Disabled when loading or empty message
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
