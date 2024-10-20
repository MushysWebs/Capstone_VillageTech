import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  clinicDetails: {
    fontSize: 10,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  boldText: {
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#e0e0e0",
    fontWeight: "bold",
  },
  tableCol: {
    width: "33.33%",
    padding: 5,
    textAlign: "center",
    borderBottom: "1px solid #000",
  },
  total: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "right",
    marginTop: 10,
  },
  footer: {
    textAlign: "right",
    fontSize: 10,
    marginTop: 20,
    color: "grey",
  },
});

const Receipt = ({ invoice, patient }) => {
  console.log("Rendering Receipt with data:", invoice, patient);

  // Ensure invoice and patient data is fully loaded
  if (!invoice || !patient) {
    console.error("Missing invoice or patient data");
    return null;
  }

  // Use appropriate fallback for missing data fields
  const ownerName = patient.owner_name || "Owner name not available";
  const ownerAddress = patient.owner_address || "Address not available";

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.boldText}>Village Vet Animal Clinic</Text>
            <Text style={styles.clinicDetails}>
              2102 14 St NW, Calgary, AB T2M 3N5{"\n"}
              Phone: (403) 800-0392{"\n"}
              Email: info@village-vet.ca
            </Text>
          </View>
          <Image style={styles.logo} src="/VillageVetLogo.png" />
        </View>

        <Text style={styles.title}>Receipt</Text>

        <View style={styles.billToSection}>
          <Text style={styles.boldText}>BILL TO</Text>
          <Text>{ownerName}</Text>
          <Text>{ownerAddress}</Text>
          <Text>
            {patient.owner_city || "City"}, {patient.owner_province || "Province"}, {patient.owner_postal_code || "Postal code"}
          </Text>
        </View>

        <View style={styles.invoiceSection}>
          <Text style={styles.boldText}>INVOICE</Text>
          <Text>Invoice #: {invoice.invoice_id}</Text>
          <Text>Date: {new Date(invoice.invoice_date).toLocaleDateString()}</Text>
          <Text>Animal: {patient.name}</Text>
          <Text>Species: {patient.species}</Text>
          <Text>Total Price: {formatCurrency(invoice.invoice_total)}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>Description</Text>
            <Text style={styles.tableCol}>Quantity</Text>
            <Text style={styles.tableCol}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>{invoice.invoice_name}</Text>
            <Text style={styles.tableCol}>1</Text>
            <Text style={styles.tableCol}>
              {formatCurrency(invoice.invoice_total)}
            </Text>
          </View>
        </View>

        <Text style={styles.total}>
          Total: {formatCurrency(invoice.invoice_total)}
        </Text>

        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
};

const formatCurrency = (value) => {
  return value.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });
};

export default Receipt;
