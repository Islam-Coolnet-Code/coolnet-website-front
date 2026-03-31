import React from 'react';

const DealerStyles: React.FC = () => {
    return (
        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .marker-default {
          animation: none;
        }
        
        .marker-selected {
          animation: bounce 1s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .leaflet-control-attribution {
          display: none !important;
        }
        
        /* Set appropriate z-index for Leaflet controls */
        .leaflet-top, 
        .leaflet-bottom {
          z-index: 40;
        }
        
        /* RTL specific styles */
        .rtl {
          direction: rtl;
        }
        
        .ltr {
          direction: ltr;
        }
        
        /* Ensure proper text alignment in RTL mode */
        .rtl .text-left {
          text-align: right;
        }
        
        .rtl .text-right {
          text-align: left;
        }
        
        /* User location marker styles */
        .user-marker-pulse {
          width: 20px;
          height: 20px;
          position: relative;
        }
        
        .user-marker-dot {
          width: 12px;
          height: 12px;
          background-color: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .user-marker-pulse::before {
          content: '';
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-out infinite;
          opacity: 0.5;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    );
};

export default DealerStyles;
