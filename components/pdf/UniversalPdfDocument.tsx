import { Text, View, StyleSheet, Image, Document, Page, Font } from '@react-pdf/renderer';

// Register standard fonts to ensure bold and italics work correctly
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.1.1/Helvetica.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.1.1/Helvetica-Bold.ttf', fontWeight: 'bold' },
    ]
});

const styles = StyleSheet.create({
    page: {
        paddingTop: 95,     // Tightened for "normal" document feel
        paddingBottom: 95,  // Tightened for "normal" document feel
        paddingHorizontal: 65,
        fontFamily: 'Helvetica',
        fontSize: 10.5,
        lineHeight: 1.5,
        color: '#222',
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 130,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 130,
    },
    footerImage: {
        width: '100%',
        height: '100%',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
    h1: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 25,
        color: '#000',
        lineHeight: 1.2,
    },
    h2: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 20,
        color: '#1a1a1a',
        borderBottom: '0.5pt solid #ddd',
        paddingBottom: 3,
        textTransform: 'uppercase',
    },
    h3: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        marginTop: 10,
        color: '#333',
    },
    text: {
        marginBottom: 4,   // Reduced from 10 to tighten layout
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 4,   // Reduced from 6
        paddingLeft: 15,
    },
    bullet: {
        width: 15,
        fontSize: 10,
        color: '#000',
        fontWeight: 'bold',
    },
    bulletContent: {
        flex: 1,
    },
    table: {
        width: '100%',
        marginVertical: 12,
        borderLeft: '0.8pt solid #333', 
        borderTop: '0.8pt solid #333',
    },
    tableRow: {
        flexDirection: 'row',
        minHeight: 22,
        alignItems: 'center',
    },
    tableColHeader: {
        flex: 1,
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderRight: '0.8pt solid #333',
        borderBottom: '0.8pt solid #333',
    },
    tableCol: {
        flex: 1,
        padding: 5,
        borderRight: '0.8pt solid #333',
        borderBottom: '0.8pt solid #333',
    },
    tableCellHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
    },
    tableCell: {
        fontSize: 9.5,
    },
    signatureContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    signatureBox: {
        width: '45%',
        borderTop: '0.8pt solid #000',
        paddingTop: 8,
        textAlign: 'center',
    },
    signatureLabel: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    signatureSublabel: {
        fontSize: 8,
        color: '#444',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    divider: {
        marginVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    spacer: {
        height: 12,
    }
});

const sanitizeText = (text: string) => {
    // Strip emojis and extended pictographics that react-pdf standard fonts can't render
    return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
};

const renderTextWithBold = (text: string) => {
    // First sanitize the string to remove emojis
    const cleanText = sanitizeText(text);
    const parts = cleanText.split('**');
    return parts.map((part, index) => {
        if (index % 2 === 1) { // It's bold
            return <Text key={index} style={styles.bold}>{part}</Text>;
        }
        return <Text key={index}>{part}</Text>;
    });
};

const MarkdownRenderer = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    const elements = [];
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];
    let skipMode = false;

    for (let i = 0; i < lines.length; i++) {
        const originalLine = lines[i];
        const line = originalLine.trim();
        
        // Specific Skip logic to remove the unwanted "EL RESULTADO" section
        const cleanLine = line.replace(/[#*_]/g, '').trim().toUpperCase();
        if (cleanLine === 'EL RESULTADO' || cleanLine === 'RESULTADOS') {
            skipMode = true;
            continue;
        }

        if (skipMode) {
            // We resume only if we find a structural divider or the footer/signature
            const isDivider = line === '---' || line.includes('________________');
            const isSignature = line.includes('Ing. César') || line.includes('Responsable:');
            
            if (isDivider || isSignature) {
                skipMode = false;
                // Don't continue, let it render the divider/signature line
            } else {
                continue;
            }
        }

        if (!line && !inTable) {
            // Do not add extra spacers for empty lines to avoid huge gaps
            continue;
        }

        if (line === '---' || line.includes('________________________________________')) {
            // Render as a simple visual divider instead of a page break
            elements.push(<View key={`break-${i}`} style={styles.divider} />);
            continue;
        }

        const isTableLine = line.includes('|');
        if (isTableLine) {
            const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
            
            // Skip the separator line (---) but keep it as part of the table detection
            if (line.includes('---')) {
                inTable = true;
                continue;
            }

            if (!inTable) {
                // If the NEXT line is a separator line (---), then this is a header
                const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
                if (nextLine.includes('|') && nextLine.includes('---')) {
                    inTable = true;
                    tableHeader = cols;
                    tableRows = [];
                    continue; // Skip rendering header line now, it will be rendered as part of the table
                } else {
                    // Not a table, just text with a pipe
                    elements.push(<Text key={i} style={styles.text}>{renderTextWithBold(line)}</Text>);
                    continue;
                }
            } else {
                // We are inside a table
                tableRows.push(cols);

                // Check if the table ends here
                const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
                if (!nextLine.includes('|')) {
                    if (tableHeader.length > 0) {
                        elements.push(
                            <View key={`table-${i}`} style={styles.table} wrap={false}>
                                <View style={styles.tableRow}>
                                    {tableHeader.map((h, idx) => (
                                        <View key={idx} style={styles.tableColHeader}>
                                            <Text style={styles.tableCellHeader}>{h}</Text>
                                        </View>
                                    ))}
                                </View>
                                {tableRows.map((row, rIdx) => (
                                    <View key={rIdx} style={styles.tableRow}>
                                        {row.map((cell, cIdx) => (
                                            <View key={cIdx} style={styles.tableCol}>
                                                <Text style={styles.tableCell}>{cell}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        );
                    }
                    inTable = false;
                    tableHeader = [];
                    tableRows = [];
                }
                continue;
            }
        }

        if (line.startsWith('### ')) {
            elements.push(<Text key={i} style={styles.h3}>{renderTextWithBold(line.replace('### ', ''))}</Text>);
        } else if (line.startsWith('## ')) {
            elements.push(<Text key={i} style={styles.h2}>{renderTextWithBold(line.replace('## ', ''))}</Text>);
        } else if (line.startsWith('# ')) {
            elements.push(<Text key={i} style={styles.h1}>{renderTextWithBold(line.replace('# ', ''))}</Text>);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            const isNested = originalLine.startsWith('  ') || originalLine.startsWith('\t');
            elements.push(
                <View key={i} style={[styles.bulletPoint, isNested ? { marginLeft: 25 } : {}]}>
                    <Text style={styles.bullet}>{isNested ? '◦' : '•'}</Text>
                    <Text style={styles.bulletContent}>{renderTextWithBold(line.replace(/^[-*] /, ''))}</Text>
                </View>
            );
        } else {
            elements.push(<Text key={i} style={styles.text}>{renderTextWithBold(line)}</Text>);
        }
    }

    return <>{elements}</>;
};

interface UniversalPdfDocumentProps {
    content: string;
    logoUrl?: string;
    footerUrl?: string;
    showSignatureLines?: boolean;
    signerName?: string;
    clientName?: string;
}

export const UniversalPdfDocument = ({
    content,
    logoUrl,
    footerUrl,
    showSignatureLines = false,
    signerName = "Ing. César Reyes Jaramillo",
    clientName = "EL CLIENTE"
}: UniversalPdfDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View fixed style={styles.header}>
                {logoUrl && <Image style={styles.headerImage} src={logoUrl} />}
            </View>

            <View>
                <MarkdownRenderer content={content} />
                
                {showSignatureLines && (
                    <View style={styles.signatureContainer} wrap={false}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>{signerName}</Text>
                            <Text style={styles.signatureSublabel}>PROVEEDOR ESTRATÉGICO</Text>
                            <Text style={styles.signatureSublabel}>WhatsApp: +593 96 341 0409</Text>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>{clientName}</Text>
                            <Text style={styles.signatureSublabel}>EL CONTRATANTE / CLIENTE</Text>
                        </View>
                    </View>
                )}
            </View>

            <View fixed style={styles.footer}>
                {footerUrl && <Image style={styles.footerImage} src={footerUrl} />}
            </View>

            <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
                fixed
            />
        </Page>
    </Document>
);
