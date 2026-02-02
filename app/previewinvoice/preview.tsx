import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

const InvoicePreview = ({ navigation }) => {
  const { invoice } = {};
  const [loading, setLoading] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const scrollViewRef = useRef();

  // Default invoice data matching your InvoiceDetail structure
  const defaultInvoice = {
    id: "INV-00123",
    status: "Draft",
    billTo: {
      company: "Aria Technologies",
      contact: "ariatech@gmail.com",
      address: "123 Tech Avenue, Suite 400\nInnovate City, CA 94043",
    },
    from: {
      company: "Alex Drake Design",
      contact: "alexdrake@gmail.com",
      address: "456 Creative Blvd, Apt 8B\nDesign District, NY 10011",
    },
    issueDate: "Jan 15, 2024",
    dueDate: "Jan 30, 2024",
    items: [
      {
        description: "UI/UX Design for Mobile App",
        details: "40 hrs @ $75.00/hr",
        amount: "$3,000.00",
      },
      {
        description: "Brand Identity & Logo",
        details: "1 qty @ $1,500.00",
        amount: "$1,500.00",
      },
    ],
    subtotal: "$4,500.00",
    tax: "$450.00",
    grandTotal: "$4,950.00",
    notes:
      "Thank you for your business. Payment is due within 15 days of the issue date.",
  };

  const currentInvoice = invoice || defaultInvoice;

  // Generate HTML for PDF using your InvoiceDetail styling
  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${currentInvoice.id}</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 40px;
            padding: 0;
            line-height: 1.6;
            color: #111827;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          .invoice-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #111827;
          }
          .status {
            display: inline-block;
            padding: 10px 25px;
            background: #fef9c3;
            color: #d97706;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
          }
          .section {
            margin-bottom: 35px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #111827;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
          }
          .bill-from-to {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            margin-bottom: 3px;
          }
          .bill-from-to > div {
            flex: 1;
          }
          .company-name {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 8px;
            color: #111827;
          }
          .contact-name {
            font-size: 16px;
            margin-bottom: 8px;
            color: #374151;
          }
          .address {
            white-space: pre-line;
            line-height: 1.6;
            color: #6b7280;
            font-size: 14px;
          }
          .invoice-details {
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 5px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: white;
          }
          .items-table th {
            background: #3b82f6;
            color: white;
            text-align: left;
            padding: 15px;
            border: 1px solid #2563eb;
            font-weight: bold;
            font-size: 16px;
          }
          .items-table td {
            padding: 15px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .text-right {
            text-align: right;
          }
          .totals {
            width: 350px;
            margin-left: auto;
            margin-top: 10px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            font-size: 16px;
          }
          .grand-total {
            border-top: 3px solid #111827;
            padding-top: 15px;
            margin-top: 15px;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: bold;
            color: #111827;
          }
          .notes-section {
            margin-top: 80px;
            padding: 25px;
            background: #f0f9ff;
            border-radius: 12px;
            border-left: 6px solid #3b82f6;
          }
          .notes-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #111827;
          }
          .notes-content {
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-number">INVOICE ${currentInvoice.id}</div>
        </div>

        <div class="bill-from-to">
          <div class="section">
            <div class="section-title">Bill To</div>
            <div class="company-name">${currentInvoice.billTo.company}</div>
            <div class="contact-name">${currentInvoice.billTo.contact}</div>
          </div>
          <div class="section">
            <div class="section-title">From</div>
            <div class="company-name">${currentInvoice.from.company}</div>
            <div class="contact-name">${currentInvoice.from.contact}</div>
          </div>
        </div>

        <div class="invoice-details">
          <div class="section-title">Invoice Details</div>
          <div class="detail-row">
            <span><strong>Invoice Number:</strong></span>
            <span>${currentInvoice.id}</span>
          </div>
          <div class="detail-row">
            <span><strong>Issue Date:</strong></span>
            <span>${currentInvoice.issueDate}</span>
          </div>
          <div class="detail-row">
            <span><strong>Due Date:</strong></span>
            <span>${currentInvoice.dueDate}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Items & Services</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Details</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${currentInvoice.items
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.description}</strong></td>
                  <td>${item.details}</td>
                  <td class="text-right"><strong>${item.amount}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${currentInvoice.subtotal}</span>
          </div>
          <div class="totals-row">
            <span>Tax (10%):</span>
            <span>${currentInvoice.tax}</span>
          </div>
          <div class="totals-row grand-total">
            <span>Grand Total:</span>
            <span>${currentInvoice.grandTotal}</span>
          </div>
        </div>

        <div class="notes-section">
          <div class="notes-title">Notes</div>
          <div class="notes-content">${currentInvoice.notes}</div>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} • Thank you for your business!
        </div>
      </body>
      </html>
    `;
  };

  // Save as PDF function
  const saveAsPDF = async () => {
    try {
      setLoading(true);

      const html = generateHTML();

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 612,
        height: 792,
      });

      const fileName = `invoice-${currentInvoice.id}.pdf`;

      // For iOS, use the sharing to save to files
      if (Platform.OS === "ios") {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Save Invoice PDF",
            UTI: "com.adobe.pdf",
          });
          Alert.alert("Success", "Invoice PDF is ready to save to your files!");
        } else {
          Alert.alert(
            "Info",
            "PDF generated but sharing not available on this device."
          );
        }
      } else {
        // For Android, download directly
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const directoryUri = permissions.directoryUri;

          // Create the file
          const fileUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              directoryUri,
              fileName,
              "application/pdf"
            );

          // Copy the PDF to the new location
          const fileData = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await FileSystem.StorageAccessFramework.writeAsStringAsync(
            fileUri,
            fileData,
            { encoding: FileSystem.EncodingType.Base64 }
          );

          Alert.alert("Success", `Invoice downloaded as ${fileName}`);
        } else {
          // Fallback to sharing if permissions not granted
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Download Invoice PDF",
          });
        }
      }

      setLoading(false);
      setShowActionsModal(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
      setLoading(false);
    }
  };

  // Print function
  const printInvoice = async () => {
    try {
      setLoading(true);

      const html = generateHTML();

      await Print.printAsync({
        html,
        orientation: "portrait",
      });

      setLoading(false);
      setShowActionsModal(false);
    } catch (error) {
      console.error("Error printing:", error);
      Alert.alert("Error", "Failed to print. Please try again.");
      setLoading(false);
    }
  };

  // Handle share invoice
  const handleShare = async () => {
    try {
      setLoading(true);

      const html = generateHTML();

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
      });

      // Use expo-sharing for better file sharing support
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share Invoice ${currentInvoice.id}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        // Fallback to React Native Share
        await Share.share(
          {
            url: uri,
            title: `Invoice ${currentInvoice.id}`,
            message: `Invoice ${currentInvoice.id} - Total: ${currentInvoice.grandTotal}`,
          },
          {
            mimeType: "application/pdf",
            dialogTitle: `Share Invoice ${currentInvoice.id}`,
          }
        );
      }

      setLoading(false);
      setShowActionsModal(false);
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share invoice. Please try again.");
      setLoading(false);
    }
  };

  // Handle send email (simulate with PDF sharing)
  const handleSendEmail = async () => {
    try {
      setLoading(true);

      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Send Invoice ${currentInvoice.id} to Client`,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error sending email:", error);
      Alert.alert("Error", "Failed to send invoice. Please try again.");
      setLoading(false);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = () => {
    Alert.alert(
      "Mark as Paid",
      `Are you sure you want to mark invoice ${currentInvoice.id} as paid?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Paid",
          style: "default",
          onPress: () => {
            Alert.alert("Success", "Invoice marked as paid");
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Handle edit invoice
  const handleEdit = () => {
    // navigation.navigate("CreateInvoice", { invoice: currentInvoice });
    Alert.alert("Edit", "Edit invoice feature coming soon!");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-lg text-gray-600 mt-4">Generating PDF...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Invoice Preview
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              Review your invoice before sending
            </Text>
          </View>

          <TouchableOpacity
            className="p-2 bg-blue-50 rounded-lg"
            onPress={() => setShowActionsModal(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
      >
        {/* Invoice Header */}
        <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Invoice {currentInvoice.id}
            </Text>
            <View className="bg-[#FEF9C3] px-3 py-1 rounded-full">
              <Text className="text-[#D97706] text-sm font-regular">
                {currentInvoice.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill To Section */}
        <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900 mb-3">
            Bill To
          </Text>
          <Text className="text-base font-semiBold text-gray-900">
            {currentInvoice.billTo.company}
          </Text>
          <Text className="text-gray-600 text-sm font-regular mt-1">
            {currentInvoice.billTo.contact}
          </Text>
        </View>

        {/* From Section */}
        <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900 mb-3">From</Text>
          <Text className="text-base font-semiBold text-gray-900">
            {currentInvoice.from.company}
          </Text>
          <Text className="text-gray-600 text-sm font-regular mt-1">
            {currentInvoice.from.contact}
          </Text>
        </View>

        {/* Invoice Details */}
        <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3 justify-between">
            <Text className="text-lg font-semiBold text-gray-900">
              Invoice Number
            </Text>
            <Text className="text-base font-semiBold text-gray-900">
              {currentInvoice.id}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600 text-sm font-regular">
              Issue Date
            </Text>
            <Text className="text-gray-600 text-sm font-regular">
              {currentInvoice.issueDate}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm font-regular">Due Date</Text>
            <Text className="text-gray-600 text-sm font-regular">
              {currentInvoice.dueDate}
            </Text>
          </View>
        </View>

        {/* Items Section */}
        <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900 mb-3">
            Items
          </Text>

          {currentInvoice.items.map((item, index) => (
            <View key={index} className="mb-4 last:mb-0">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-base font-semiBold text-gray-900 flex-1 mr-2">
                  {item.description}
                </Text>
                <Text className="text-base font-semiBold text-gray-900">
                  {item.amount}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm font-regular">
                {item.details}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600 text-sm font-regular">Subtotal</Text>
            <Text className="text-gray-600 text-sm font-regular">
              {currentInvoice.subtotal}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-sm font-regular">
              Tax (10%)
            </Text>
            <Text className="text-gray-600 text-sm font-regular">
              {currentInvoice.tax}
            </Text>
          </View>
          <View className="border-t border-gray-200 pt-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semiBold text-gray-900">
                Grand Total
              </Text>
              <Text className="text-lg font-bold text-gray-900">
                {currentInvoice.grandTotal}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View className="bg-white rounded-[12px] p-4 mb-8 border border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900 mb-3">
            Notes
          </Text>
          <Text className="text-gray-600 text-sm font-regular leading-5">
            {currentInvoice.notes}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-8 pt-4">
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 px-6 flex-row justify-center items-center mb-3"
            onPress={handleSendEmail}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-lg ml-2">
              Send to Client
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActionsModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-semibold text-center text-gray-900 mb-4">
              Actions
            </Text>

            <TouchableOpacity
              className="flex-row items-center py-4 px-3 rounded-lg mb-2 bg-gray-50"
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={24} color="#3B82F6" />
              <Text className="text-lg text-gray-700 ml-3">Share Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4 px-3 rounded-lg mb-2 bg-gray-50"
              onPress={saveAsPDF}
            >
              <Ionicons name="download" size={24} color="#3B82F6" />
              <Text className="text-lg text-gray-700 ml-3">Save as PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4 px-3 rounded-lg mb-2 bg-gray-50"
              onPress={printInvoice}
            >
              <Ionicons name="print" size={24} color="#3B82F6" />
              <Text className="text-lg text-gray-700 ml-3">Print Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 rounded-lg bg-gray-100 mt-2"
              onPress={() => setShowActionsModal(false)}
            >
              <Text className="text-lg font-medium text-gray-700 text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InvoicePreview;
