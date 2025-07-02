"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function KayitPage() {
  const [bilgi, setBilgi] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bilgi.trim()) {
      setMesaj("Lütfen bir bilgi girin!");
      return;
    }

    setIsLoading(true);
    setMesaj("");

    try {
      await addDoc(collection(db, "kayitlar"), {
        bilgi: bilgi,
        tarih: new Date().toISOString(),
        timestamp: new Date()
      });
      
      setBilgi("");
      setMesaj("Bilgi başarıyla kaydedildi!");
    } catch (error) {
      console.error("Hata:", error);
      setMesaj("Bir hata oluştu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 500, 
      margin: "2rem auto", 
      padding: "2rem",
      fontFamily: "sans-serif",
      border: "1px solid #ddd",
      borderRadius: "8px"
    }}>
      <h1>Bilgi Kayıt Formu</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            value={bilgi}
            onChange={(e) => setBilgi(e.target.value)}
            placeholder="Kaydedilecek bilgiyi girin..."
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginBottom: "1rem"
            }}
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>

      {mesaj && (
        <div style={{
          padding: "10px",
          borderRadius: "4px",
          backgroundColor: mesaj.includes("başarıyla") ? "#d4edda" : "#f8d7da",
          color: mesaj.includes("başarıyla") ? "#155724" : "#721c24",
          border: `1px solid ${mesaj.includes("başarıyla") ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {mesaj}
        </div>
      )}
    </div>
  );
} 