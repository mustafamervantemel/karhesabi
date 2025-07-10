import React, { useState, useRef } from "react";
import {
  Calculator,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Info,
} from "lucide-react";

function ProfitCalculator() {
  const [formData, setFormData] = useState({
    salePrice: "",
    commission: "",
    vatRate: 20,
    discountType: "percentage",
    discountValue: "",
    shippingIncome: "",
    productCost: "",
    packagingCost: "",
    laborCost: "",
    shippingCost: "",
    advertisingCost: "",
  });

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const reportRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateProfit = () => {
    const {
      salePrice,
      commission,
      vatRate,
      discountType,
      discountValue,
      shippingIncome,
      productCost,
      packagingCost,
      laborCost,
      shippingCost,
      advertisingCost,
    } = formData;

    if (!salePrice || !productCost || !commission) {
      alert(
        "Lütfen satış fiyatı, ürün maliyeti ve komisyon oranı alanlarını doldurun."
      );
      return;
    }

    const price = parseFloat(salePrice) || 0;
    const commissionRate = parseFloat(commission) || 0;
    const vat = parseFloat(vatRate) || 0;
    const vatDivisor = 1 + vat / 100;
    const vatDecimal = vat / 100;

    // İndirim hesaplama
    let discountAmount = 0;
    if (discountValue) {
      if (discountType === "percentage") {
        discountAmount = (price * parseFloat(discountValue)) / 100;
      } else {
        discountAmount = parseFloat(discountValue);
      }
    }
    const discountedPrice = price - discountAmount;

    // KDV'siz fiyat
    const priceWithoutVat = discountedPrice / vatDivisor;
    const saleVat = discountedPrice - priceWithoutVat;

    // Komisyon (KDV'siz fiyattan)
    const commissionAmount = priceWithoutVat * (commissionRate / 100);
    const commissionVat = commissionAmount * vatDecimal;

    // Hizmet Bedeli (KDV dahil, sabit)
    const serviceFee = 9.79;

    // Maliyetlerin KDV'siz ve KDV'li halleri
    const productCostVal = parseFloat(productCost) || 0;
    const packagingCostVal = parseFloat(packagingCost) || 0;
    const laborCostVal = parseFloat(laborCost) || 0;
    const shippingCostVal = parseFloat(shippingCost) || 0;
    const advertisingCostVal = parseFloat(advertisingCost) || 0;

    const productCostVat = productCostVal / vatDivisor * vatDecimal;
    const packagingCostVat = packagingCostVal / vatDivisor * vatDecimal;
    const shippingCostVat = shippingCostVal / vatDivisor * vatDecimal;
    const advertisingCostVat = advertisingCostVal / vatDivisor * vatDecimal;

    // Ödenecek KDV
    // Satış Fiyatı KDV - (Ürün Maliyeti KDV + Paketleme KDV + Kargo KDV + Reklam KDV + Komisyon KDV)
    const payableVat = saleVat - (
      productCostVat + packagingCostVat + shippingCostVat + advertisingCostVat + commissionVat
    );

    // Toplam Kesinti
    const totalPlatformFees =
      commissionAmount + serviceFee + commissionVat + payableVat;

    // Toplam maliyet (KDV dahil)
    const totalCosts =
      productCostVal + packagingCostVal + laborCostVal + shippingCostVal + advertisingCostVal;

    // Net kâr hesabı
    const netRevenue = discountedPrice + (parseFloat(shippingIncome) || 0);
    const finalProfit = netRevenue - totalCosts - totalPlatformFees;

    setResult({
      originalPrice: price,
      discountAmount,
      discountedPrice,
      netRevenue,
      totalCosts,
      platformFees: {
        commission: commissionAmount,
        serviceFee: serviceFee,
        serviceFeeBare: serviceFee, // KDV dahil olduğu için aynı
        serviceFeeVat: 0, // KDV dahil olduğu için ayrı gösterilmiyor
        payableVat: payableVat,
        saleVat: saleVat,
        commissionVat: commissionVat,
        total: totalPlatformFees,
        // Ekstra detaylar
        productCostVat,
        packagingCostVat,
        shippingCostVat,
        advertisingCostVat,
      },
      finalProfit,
      profitMargin: ((finalProfit / netRevenue) * 100).toFixed(2),
      commissionRate,
      priceWithoutVat,
    });
  };

  const generatePDF = async () => {
    if (!result) return;

    try {
      // Dynamic import for PDF generation
      const { jsPDF } = await import("jspdf");
      const html2canvas = await import("html2canvas");

      const element = reportRef.current;
      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `kar-zarar-raporu-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      alert("PDF oluşturulurken bir hata oluştu.");
    }
  };

  // Pie ve Bar chart için detaylı gider verisi hazırla
  const getExpenseDetails = () => {
    if (!result) return [];
    return [
      {
        name: "Ü Maliyeti",
        value: parseFloat(formData.productCost) || 0,
        color: "#ef4444",
        icon: "📦",
      },
      {
        name: "Paketleme",
        value: parseFloat(formData.packagingCost) || 0,
        color: "#f59e0b",
        icon: "📦",
      },
      {
        name: "İşçilik",
        value: parseFloat(formData.laborCost) || 0,
        color: "#10b981",
        icon: "👷",
      },
      {
        name: "Kargo",
        value: parseFloat(formData.shippingCost) || 0,
        color: "#3b82f6",
        icon: "🚚",
      },
      {
        name: "Reklam",
        value: parseFloat(formData.advertisingCost) || 0,
        color: "#a21caf",
        icon: "📢",
      },
      {
        name: "Komisyon",
        value: result.platformFees.commission,
        color: "#f59e0b",
        icon: "🏛️",
      },
      {
        name: "Hizmet Bedeli (9.79₺)",
        value: result.platformFees.serviceFee,
        color: "#ea580c",
        icon: "⚙️",
      },
      {
        name: "Komisyon KDV",
        value: result.platformFees.commissionVat,
        color: "#dc2626",
        icon: "📊",
      },
      {
        name: "Hizmet Bedeli KDV",
        value: result.platformFees.serviceFeeVat,
        color: "#b91c1c",
        icon: "🧾",
      },
      {
        name: "Ödenecek KDV",
        value: result.platformFees.payableVat,
        color: "#991b1b",
        icon: "💳",
      },
    ];
  };

  // Profitability analysis helper
  const getProfitabilityAnalysis = () => {
    if (!result) return null;
    
    const profitMargin = parseFloat(result.profitMargin);
    let status = "excellent";
    let message = "Mükemmel kâr marjı";
    let color = "green";
    
    if (profitMargin < 0) {
      status = "loss";
      message = "Zarar durumu";
      color = "red";
    } else if (profitMargin < 5) {
      status = "poor";
      message = "Düşük kâr marjı";
      color = "red";
    } else if (profitMargin < 15) {
      status = "fair";
      message = "Orta kâr marjı";
      color = "yellow";
    } else if (profitMargin < 25) {
      status = "good";
      message = "İyi kâr marjı";
      color = "blue";
    }
    
    return { status, message, color, profitMargin };
  };

  const ChartComponent = ({ data, type }) => {
    if (!data) return null;
    const expenseDetails = getExpenseDetails();
    const profitAnalysis = getProfitabilityAnalysis();

    if (type === "bar") {
      const maxValue = Math.max(...expenseDetails.map(item => item.value));
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-blue-500" />
              Gider Analizi
            </h4>
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-700">Detaylı Görünüm</span>
            </div>
          </div>
          <div className="space-y-4">
            {expenseDetails.map((item, index) => (
              <div key={item.name} className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">₺{item.value.toFixed(2)}</span>
                    <div className="text-xs text-gray-500">
                      {((item.value / (data.totalCosts + data.platformFees.total)) * 100).toFixed(1)}% toplam
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: `${Math.min(100, (item.value / Math.max(maxValue, 1)) * 100)}%`,
                      backgroundColor: item.color,
                      animation: `slideIn 0.8s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900">Toplam Gider</span>
              <span className="text-xl font-bold text-blue-700">
                ₺{(data.totalCosts + data.platformFees.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (type === "pie") {
      const total = data.totalCosts + data.platformFees.total;
      let acc = 0;
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-gray-900 flex items-center">
              <PieChart className="w-6 h-6 mr-3 text-purple-500" />
              Gider Dağılımı
            </h4>
            <div className="bg-purple-50 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-purple-700">Yüzdelik Görünüm</span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 relative">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  {expenseDetails.map((item, idx) => {
                    const percent = total === 0 ? 0 : (item.value / total) * 100;
                    if (percent === 0) return null;
                    const dasharray = `${percent} ${100 - percent}`;
                    const dashoffset = -acc;
                    acc += percent;
                    return (
                      <path
                        key={item.name}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="4"
                        strokeDasharray={dasharray}
                        strokeDashoffset={dashoffset}
                        className="transition-all duration-1000 ease-out"
                        style={{
                          animation: `drawPath 1.5s ease-out ${idx * 0.1}s both`,
                        }}
                      />
                    );
                  })}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    ₺{total.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-600 mt-1">Toplam</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full space-y-3">
              {expenseDetails.map((item, index) => {
                const percentage = total === 0 ? 0 : ((item.value / total) * 100);
                if (percentage === 0) return null;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <div className="text-sm text-gray-500">₺{item.value.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg" style={{ color: item.color }}>
                        %{percentage.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {profitAnalysis && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    profitAnalysis.color === 'green' ? 'bg-green-500' :
                    profitAnalysis.color === 'blue' ? 'bg-blue-500' :
                    profitAnalysis.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-semibold text-purple-900">{profitAnalysis.message}</span>
                </div>
                <span className={`text-lg font-bold ${
                  profitAnalysis.color === 'green' ? 'text-green-600' :
                  profitAnalysis.color === 'blue' ? 'text-blue-600' :
                  profitAnalysis.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  %{profitAnalysis.profitMargin.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes drawPath {
          from {
            stroke-dasharray: 0 100;
          }
          to {
            stroke-dasharray: var(--dash-array, 0 100);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        /* Number input spin buttonlarını gizle */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Calculator className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-4">
            Profesyonel Kâr/Zarar Analizi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trendyol satışlarınızın detaylı analizini yapın, görsel raporlar oluşturun ve profesyonel PDF raporları indirin
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
              <Info className="w-4 h-4 mr-2" />
              Tüm gelir ve maliyetler KDV dahil girilmelidir
            </span>
            <span className="inline-flex items-center bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Detaylı görsel analiz raporları
            </span>
            <span className="inline-flex items-center bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              PDF rapor indirme
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 ${
                  activeTab === "calculator"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100"
                }`}
              >
                <Calculator className="w-5 h-5" />
                <span>Hesaplayıcı</span>
              </button>
              {result && (
                <button
                  onClick={() => setActiveTab("charts")}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 ${
                    activeTab === "charts"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Grafikler</span>
                </button>
              )}
              {result && (
                <button
                  onClick={() => setActiveTab("report")}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 ${
                    activeTab === "report"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Rapor</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-6 py-5">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Package className="w-6 h-6 mr-3" />
                    Satış Bilgileri
                  </h2>
                  <p className="text-orange-100 mt-2 text-sm">Ürününüzün satış bilgilerini girin</p>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-medium">
                      Tüm gelir ve maliyetler KDV dahil olarak girilmelidir.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Satış Fiyatı */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Satış Fiyatı (₺) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="salePrice"
                          value={formData.salePrice}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          placeholder="149.99"
                        />
                        {/* Dolar işareti kaldırıldı */}
                      </div>
                    </div>
                    {/* Komisyon Oranı */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Komisyon Oranı (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="commission"
                          value={formData.commission}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          placeholder="15"
                        />
                        {/* Yüzde işareti kaldırıldı */}
                      </div>
                    </div>
                    {/* KDV Oranı */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        KDV Oranı (%)
                      </label>
                      <select
                        name="vatRate"
                        value={formData.vatRate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        <option value="20">%20</option>
                        <option value="10">%10</option>
                        <option value="1">%1</option>
                        <option value="0">%0</option>
                      </select>
                    </div>
                    {/* İndirim Türü */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        İndirim Türü
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed">Sabit Tutar (₺)</option>
                      </select>
                    </div>
                    {/* İndirim Değeri */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        İndirim Değeri
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder={
                          formData.discountType === "percentage"
                            ? "20"
                            : "30.00"
                        }
                      />
                    </div>
                    {/* Kargo Geliri */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Kargo Geliri (₺)
                      </label>
                      <input
                        type="number"
                        name="shippingIncome"
                        value={formData.shippingIncome}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder="9.99"
                      />
                    </div>
                  </div>
                  {/* Maliyetler */}
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 px-6 py-4 rounded-xl">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <DollarSign className="w-6 h-6 mr-3" />
                        Maliyet Bilgileri
                      </h3>
                      <p className="text-green-100 mt-2 text-sm">Tüm giderlerinizi detaylı olarak girin</p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Ürün Maliyeti */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Ürün Maliyeti (₺) *
                        </label>
                        <input
                          type="number"
                          name="productCost"
                          value={formData.productCost}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="50.00"
                        />
                      </div>
                      {/* Paketleme Maliyeti */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Paketleme Maliyeti (₺)
                        </label>
                        <input
                          type="number"
                          name="packagingCost"
                          value={formData.packagingCost}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="2.50"
                        />
                      </div>
                      {/* İşçilik Maliyeti */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          İşçilik Maliyeti (₺)
                        </label>
                        <input
                          type="number"
                          name="laborCost"
                          value={formData.laborCost}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="5.00"
                        />
                      </div>
                      {/* Kargo Gideri */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Kargo Gideri (₺)
                        </label>
                        <input
                          type="number"
                          name="shippingCost"
                          value={formData.shippingCost}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="8.00"
                        />
                      </div>
                      {/* Reklam Gideri */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Reklam Gideri (₺)
                        </label>
                        <input
                          type="number"
                          name="advertisingCost"
                          value={formData.advertisingCost}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="15.00"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={calculateProfit}
                    className="w-full mt-8 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Calculator className="w-6 h-6 mr-3 relative z-10" />
                    <span className="text-lg relative z-10">Kâr/Zarar Hesapla</span>
                    <TrendingUp className="w-5 h-5 ml-3 relative z-10" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-1">
              {result ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    Hesaplama Sonucu
                  </h3>

                  <div className="space-y-6">
                    {/* Ana Sonuç */}
                    <div
                      className={`p-6 rounded-xl border-2 ${
                        result.finalProfit >= 0
                          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                          : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          Nihai Sonuç:
                        </span>
                        <div className="flex items-center">
                          {result.finalProfit >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <span
                            className={`text-2xl font-bold ${
                              result.finalProfit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ₺{result.finalProfit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Kâr Marjı:{" "}
                        <span className="font-semibold">
                          %{result.profitMargin}
                        </span>
                      </div>
                    </div>

                    {/* Detaylar */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                          Gelir Detayı
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Orijinal Fiyat:
                            </span>
                            <span className="font-medium">
                              ₺{result.originalPrice.toFixed(2)}
                            </span>
                          </div>
                          {result.discountAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">İndirim:</span>
                              <span className="text-red-600 font-medium">
                                -₺{result.discountAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span className="text-gray-900">Net Gelir:</span>
                            <span className="text-green-600">
                              ₺{result.netRevenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-orange-500" />
                          Platform Kesintileri
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              KDV'siz Fiyat:
                            </span>
                            <span className="text-gray-900 font-medium">
                              ₺{result.priceWithoutVat.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Komisyon (%{result.commissionRate}):
                            </span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.commission.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hizmet Bedeli (9.79₺):</span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.serviceFee.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Komisyon KDV:</span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.commissionVat.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hizmet Bedeli KDV:</span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.serviceFeeVat.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ödenecek KDV:</span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.payableVat.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Satış Fiyatı KDV:</span>
                            <span className="text-gray-900 font-medium">
                              ₺{result.platformFees.saleVat.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span className="text-gray-900">
                              Toplam Kesinti:
                            </span>
                            <span className="text-red-600">
                              -₺{result.platformFees.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-blue-500" />
                          Toplam Giderler
                        </h4>
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Maliyet:</span>
                          <span className="text-red-600">
                            -₺{result.totalCosts.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uyarı */}
                  {result.finalProfit < 0 && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-800">
                            Zarar Uyarısı
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            Bu satıştan zarar ediyorsunuz. Maliyetlerinizi
                            gözden geçirin veya satış fiyatınızı artırın.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hesaplama Bekleniyor
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ürün bilgilerini doldurun ve "Hesapla" butonuna tıklayın.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "charts" && result && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Görsel Analiz Raporları</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Giderlerinizi ve kârlılığınızı görsel olarak analiz edin
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartComponent data={result} type="bar" />
              <ChartComponent data={result} type="pie" />
            </div>
            
            {/* Profit Analysis Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
                Kârlılık Özeti
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ₺{result.netRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-green-800">Toplam Gelir</div>
                  <div className="text-xs text-green-600 mt-1">Kargo dahil</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    ₺{(result.totalCosts + result.platformFees.total).toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-red-800">Toplam Gider</div>
                  <div className="text-xs text-red-600 mt-1">Tüm kesintiler dahil</div>
                </div>
                <div
                    className={`rounded-lg p-4 border ${
                      result.finalProfit >= 0
                        ? "bg-blue-50 border-blue-200" 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                  <div className={`text-3xl font-bold mb-2 ${
                    result.finalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    ₺{Math.abs(result.finalProfit).toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${
                    result.finalProfit >= 0 ? 'text-blue-800' : 'text-orange-800'
                  }`}>
                    {result.finalProfit >= 0 ? 'Net Kâr' : 'Net Zarar'}
                  </div>
                  <div className={`text-xs mt-1 ${
                    result.finalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    %{result.profitMargin} marj
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "report" && result && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-3" />
                  Detaylı Analiz Raporu
                </h2>
                <p className="text-blue-100 mt-2 text-sm">Profesyonel PDF raporu oluşturun</p>
              </div>
              <button
                onClick={generatePDF}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>PDF İndir</span>
              </button>
            </div>

            <div ref={reportRef} className="p-8">
              <div className="max-w-4xl mx-auto">
                {/* Rapor Başlığı */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Kâr/Zarar Analiz Raporu
                  </h1>
                  <p className="text-gray-600">
                    Oluşturulma Tarihi: {new Date().toLocaleDateString("tr-TR")}
                  </p>
                  <div className="mt-2">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium text-sm">
                      Tüm gelir ve maliyetler KDV dahil olarak girilmiştir.
                    </span>
                  </div>
                </div>

                {/* Özet Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Net Gelir
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      ₺{result.netRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-2">
                      Toplam Gider
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                      ₺
                      {(result.totalCosts + result.platformFees.total).toFixed(
                        2
                      )}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-4 border ${
                      result.finalProfit >= 0
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-2 ${
                        result.finalProfit >= 0
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {result.finalProfit >= 0 ? "Net Kâr" : "Net Zarar"}
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        result.finalProfit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₺{Math.abs(result.finalProfit).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Detaylı Analiz */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-blue-500" />
                        Satış Bilgileri
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Orijinal Fiyat:</span>
                          <span className="font-medium">
                            ₺{result.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">İndirim:</span>
                          <span className="font-medium">
                            ₺{result.discountAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Komisyon Oranı:</span>
                          <span className="font-medium">
                            %{result.commissionRate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">KDV Oranı:</span>
                          <span className="font-medium">
                            %{formData.vatRate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                        Gelir Dağılımı
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ürün Satışı:</span>
                          <span className="font-medium">
                            ₺{result.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kargo Geliri:</span>
                          <span className="font-medium">
                            ₺
                            {(parseFloat(formData.shippingIncome) || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900">Toplam Gelir:</span>
                          <span className="text-green-600">
                            ₺{result.netRevenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-orange-500" />
                        Platform Kesintileri
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">KDV'siz Fiyat:</span>
                          <span className="text-gray-900 font-medium">
                            ₺{result.priceWithoutVat.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Komisyon:</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.commission.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hizmet Bedeli (9.79₺):</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.serviceFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Komisyon KDV:</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.commissionVat.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hizmet Bedeli KDV:</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.serviceFeeVat.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ödenecek KDV:</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.payableVat.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Satış Fiyatı KDV:</span>
                          <span className="text-gray-900 font-medium">
                            ₺{result.platformFees.saleVat.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900">Toplam Kesinti:</span>
                          <span className="text-red-600">
                            -₺{result.platformFees.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-blue-500" />
                        Maliyet Dağılımı
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ürün Maliyeti:</span>
                          <span className="font-medium">
                            ₺
                            {(parseFloat(formData.productCost) || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paketleme:</span>
                          <span className="font-medium">
                            ₺
                            {(parseFloat(formData.packagingCost) || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">İşçilik:</span>
                          <span className="font-medium">
                            ₺{(parseFloat(formData.laborCost) || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kargo:</span>
                          <span className="font-medium">
                            ₺
                            {(parseFloat(formData.shippingCost) || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reklam:</span>
                          <span className="font-medium">
                            ₺
                            {(
                              parseFloat(formData.advertisingCost) || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900">Toplam Maliyet:</span>
                          <span className="text-red-600">
                            -₺{result.totalCosts.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kâr Marjı Analizi */}
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Kâr Marjı Analizi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        %{result.profitMargin}
                      </div>
                      <div className="text-sm text-gray-600">Kâr Marjı</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.finalProfit >= 0 ? "Kârlı" : "Zararlı"}
                      </div>
                      <div className="text-sm text-gray-600">Durum</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ₺{result.finalProfit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Net Sonuç</div>
                    </div>
                  </div>
                </div>

                {/* Öneriler */}
                {result.finalProfit < 0 && (
                  <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      İyileştirme Önerileri
                    </h3>
                    <ul className="space-y-2 text-red-700">
                      <li>• Satış fiyatınızı artırmayı değerlendirin</li>
                      <li>• Ürün maliyetlerinizi optimize edin</li>
                      <li>• Komisyon oranınızı pazarlık edin</li>
                      <li>• Kargo ve paketleme maliyetlerini düşürün</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfitCalculator;