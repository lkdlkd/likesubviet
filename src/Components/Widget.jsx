import React from 'react';

const Widget = ({ configWeb }) => {
    const config = configWeb || {};
    const lienhe = Array.isArray(config.lienhe) ? config.lienhe : []; // Đảm bảo lienhe là một mảng

    // Nếu không có liên hệ, không hiển thị gì
   if (lienhe.logolienhe == "") {
        return null;
    }

    return (
        <div className="widget-container">
            {lienhe.map((contact, index) => (
                <div key={index} className="widget-item">
                    <a
                        href={contact.value}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            className="lienhe"
                            style={{ height: "50px", width: "50px" }}
                            src={contact.logolienhe}
                            alt={contact.type || "Liên hệ"}
                        />
                    </a>
                </div>
            ))}
        </div>
    );
};

export default Widget;