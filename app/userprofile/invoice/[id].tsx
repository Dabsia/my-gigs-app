import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Download, Edit, Share2, Trash2 } from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

const InvoiceDetail = () => {
  const [invoice] = useState({
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
  });

  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          <div class="invoice-number">INVOICE ${invoice.id}</div>
        </div>

        <div class="bill-from-to">
          <div class="section">
            <div class="section-title">Bill To</div>
            <div class="company-name">${invoice.billTo.company}</div>
            <div class="contact-name">${invoice.billTo.contact}</div>
            
          </div>
          <div class="section">
            <div class="section-title">From</div>
            <div class="company-name">${invoice.from.company}</div>
            <div class="contact-name">${invoice.from.contact}</div>
            
          </div>
        </div>

        <div class="invoice-details">
          <div class="section-title">Invoice Details</div>
          <div class="detail-row">
            <span><strong>Invoice Number:</strong></span>
            <span>${invoice.id}</span>
          </div>
          <div class="detail-row">
            <span><strong>Issue Date:</strong></span>
            <span>${invoice.issueDate}</span>
          </div>
          <div class="detail-row">
            <span><strong>Due Date:</strong></span>
            <span>${invoice.dueDate}</span>
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
              ${invoice.items
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
            <span>${invoice.subtotal}</span>
          </div>
          <div class="totals-row">
            <span>Tax (10%):</span>
            <span>${invoice.tax}</span>
          </div>
          <div class="totals-row grand-total">
            <span>Grand Total:</span>
            <span>${invoice.grandTotal}</span>
          </div>
        </div>

        <div class="notes-section">
          <div class="notes-title">Notes</div>
          <div class="notes-content">${invoice.notes}</div>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} • Thank you for your business!
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    try {
      //   Alert.alert("Download", "Generating PDF invoice...");

      const html = generateInvoiceHTML();

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
        width: 612, // US Letter width
        height: 792, // US Letter height
      });

      console.log("PDF generated at:", uri);

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
          const fileName = `invoice-${invoice.id}.pdf`;

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
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download invoice. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      //   Alert.alert("Share", "Generating PDF for sharing...");

      const html = generateInvoiceHTML();

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
      });

      console.log("PDF for sharing:", uri);

      // Use expo-sharing for better file sharing support
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share Invoice ${invoice.id}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        // Fallback to React Native Share
        await Share.share(
          {
            url: uri,
            title: `Invoice ${invoice.id}`,
            message: `Invoice ${invoice.id} - Total: ${invoice.grandTotal}`,
          },
          {
            mimeType: "application/pdf",
            dialogTitle: `Share Invoice ${invoice.id}`,
          }
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share invoice. Please try again.");
    }
  };

  const handleEdit = () => {
    Alert.alert("Edit", "Edit invoice feature coming soon!");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Invoice",
      `Are you sure you want to delete ${invoice.id}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Delete invoice:", invoice.id);
            Alert.alert("Success", "Invoice deleted successfully!");
          },
        },
      ]
    );
  };

  const ActionButton = ({ icon: Icon, label, onPress, color = "#061D3F" }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center py-3 bg-white rounded-lg border border-gray-200 mx-1"
    >
      <Icon size={20} color={color} />
      <Text className="text-xs text-gray-600 mt-1 font-regular">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Layout>
      <View className="flex-1">
        {/* Header with Back Button and Actions */}
        <View className="pt-4 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <BackBtn title={`Invoice ${invoice.id}`} />
          </View>

          {/* Status Badge */}
          <View className="bg-[#FEF9C3] self-start px-3 py-1 rounded-full">
            <Text className="text-[#D97706] text-sm font-regular">
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* Invoice Content */}
        <ScrollView
          className="flex-1 py-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Bill To Section */}
          <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Bill To
            </Text>
            <Text className="text-base font-semiBold text-gray-900">
              {invoice.billTo.company}
            </Text>
            <Text className="text-gray-600 text-sm font-regular mt-1">
              {invoice.billTo.contact}
            </Text>
          </View>

          {/* From Section */}
          <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              From
            </Text>
            <Text className="text-base font-semiBold text-gray-900">
              {invoice.from.company}
            </Text>
            <Text className="text-gray-600 text-sm font-regular mt-1">
              {invoice.from.contact}
            </Text>
          </View>

          {/* Invoice Details */}
          <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center mb-3 justify-between">
              <Text className="text-lg font-semiBold text-gray-900">
                Invoice Number
              </Text>
              <Text className="text-base font-semiBold text-gray-900">
                {invoice.id}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600 text-sm font-regular">
                Issue Date
              </Text>
              <View className="items-end">
                <Text className="text-gray-600 text-sm font-regular mt-1">
                  {invoice.issueDate}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-sm font-regular">
                Due Date
              </Text>
              <Text className="text-gray-600 text-sm font-regular">
                {invoice.dueDate}
              </Text>
            </View>
          </View>

          {/* Items Section */}
          <View className="bg-white rounded-[12px] p-4 mb-4 border border-gray-200">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Services
            </Text>

            {invoice.items.map((item, index) => (
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
              <Text className="text-gray-600 text-sm font-regular">
                Subtotal
              </Text>
              <Text className="text-gray-600 text-sm font-regular">
                {invoice.subtotal}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600 text-sm font-regular">
                Tax (10%)
              </Text>
              <Text className="text-gray-600 text-sm font-regular">
                {invoice.tax}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semiBold text-gray-900">
                  Grand Total
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  {invoice.grandTotal}
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
              {invoice.notes}
            </Text>
          </View>
          {/* Bottom Action Buttons */}
          <View className="border-t border-gray-200 mb-10 py-4">
            <View className="flex-row justify-between">
              <ActionButton
                icon={Download}
                label="Download"
                onPress={handleDownload}
              />
              {/* <ActionButton icon={Edit} label="Edit" onPress={handleEdit} /> */}
              <ActionButton icon={Share2} label="Share" onPress={handleShare} />
              <ActionButton
                icon={Trash2}
                label="Delete"
                onPress={handleDelete}
                color="#DC2626"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
};

export default InvoiceDetail;
