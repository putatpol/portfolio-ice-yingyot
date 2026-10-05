import React from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import CSS สำหรับ Layout และ UI Controls
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewer({ pdfUrl }) {
  // สร้าง Toolbar / Plugins สำเร็จรูป
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // ซ่อน Sidebar แถบข้างเพื่อเพิ่มพื้นที่อ่าน
  });

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      {/* โหลด Worker ของ PDF.js */}
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          // ปรับความกว้างให้พอดีหน้าจอมือถือ/จอคอมให้อัตโนมัติ
          defaultScale={SpecialZoomLevel.PageWidth}
        />
      </Worker>
    </div>
  );
}