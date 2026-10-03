import * as ExcelJS from 'exceljs';
import path from 'path';

export interface CollectionData {
    url: string;
    loadTime: number; // in seconds
}

export class ExcelUtil {
    static async generateReport(data: CollectionData[], fileName: string = 'Collection_Load_Times.xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Load Times');

        worksheet.columns = [
            { header: 'Collection URL', key: 'url', width: 80 },
            { header: 'Load Time (s)', key: 'loadTime', width: 20 },
            { header: 'Status', key: 'status', width: 20 }
        ];

        // Make headers bold
        worksheet.getRow(1).font = { bold: true };

        data.forEach((item) => {
            const isHighLoad = item.loadTime > 3; // Let's consider > 3s as high load

            const row = worksheet.addRow({
                url: item.url,
                loadTime: item.loadTime,
                status: isHighLoad ? 'High Load' : 'Normal'
            });

            // If load time is high, color the row red
            if (isHighLoad) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFC7CE' } // light red
                    };
                    cell.font = {
                        color: { argb: 'FF9C0006' } // dark red text
                    };
                });
            }
        });

        const outputPath = path.join(process.cwd(), fileName);
        await workbook.xlsx.writeFile(outputPath);
        console.log(`Excel report generated successfully at: ${outputPath}`);
    }
}
