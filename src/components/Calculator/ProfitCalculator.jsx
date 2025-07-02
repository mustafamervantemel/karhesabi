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

    // Zorunlu alanları kontrol et
    if (!salePrice || !productCost || !commission) {
      alert(
        "Lütfen satış fiyatı, ürün maliyeti ve komisyon oranı alanlarını doldurun."
      );
      return;
    }

    const price = parseFloat(salePrice) || 0;
    const commissionRate = parseFloat(commission) || 0;

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

    // Platform kesintileri
    const commissionAmount = (discountedPrice * commissionRate) / 100;
    const vatAmount = (discountedPrice * parseFloat(vatRate)) / 100;

    // Gelirler
    const netRevenue = discountedPrice + (parseFloat(shippingIncome) || 0);

    // Giderler
    const totalCosts =
      (parseFloat(productCost) || 0) +
      (parseFloat(packagingCost) || 0) +
      (parseFloat(laborCost) || 0) +
      (parseFloat(shippingCost) || 0) +
      (parseFloat(advertisingCost) || 0);

    const platformFees = commissionAmount + vatAmount;
    const finalProfit = netRevenue - totalCosts - platformFees;

    setResult({
      originalPrice: price,
      discountAmount,
      discountedPrice,
      netRevenue,
      totalCosts,
      platformFees: {
        commission: commissionAmount,
        vat: vatAmount,
        total: platformFees,
      },
      finalProfit,
      profitMargin: ((finalProfit / netRevenue) * 100).toFixed(2),
      commissionRate,
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
        name: "Ürün Maliyeti",
        value: parseFloat(formData.productCost) || 0,
        color: "#ef4444",
      },
      {
        name: "Paketleme",
        value: parseFloat(formData.packagingCost) || 0,
        color: "#f59e42",
      },
      {
        name: "İşçilik",
        value: parseFloat(formData.laborCost) || 0,
        color: "#10b981",
      },
      {
        name: "Kargo",
        value: parseFloat(formData.shippingCost) || 0,
        color: "#3b82f6",
      },
      {
        name: "Reklam",
        value: parseFloat(formData.advertisingCost) || 0,
        color: "#a21caf",
      },
      {
        name: "Platform Kesintileri",
        value: result.platformFees.total,
        color: "#fbbf24",
      },
    ];
  };

  const ChartComponent = ({ data, type }) => {
    if (!data) return null;
    const expenseDetails = getExpenseDetails();

    if (type === "bar") {
      // Her gider kalemi için bar göster
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Gider Dağılımı (Bar)
          </h4>
          <div className="space-y-2">
            {expenseDetails.map((item) => (
              <div key={item.name} className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="font-medium">₺{item.value.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (item.value /
                          (data.totalCosts + data.platformFees.total)) *
                          100
                      )}%`,
                      backgroundColor: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === "pie") {
      // Pie chart: Her gider kalemi için dilim
      const total = data.totalCosts + data.platformFees.total;
      let acc = 0;
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            Gider Dağılımı (Pie)
          </h4>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg
                className="w-40 h-40 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                {expenseDetails.map((item, idx) => {
                  const percent = total === 0 ? 0 : (item.value / total) * 100;
                  const dasharray = `${percent} ${100 - percent}`;
                  const dashoffset = -acc;
                  acc += percent;
                  return (
                    <path
                      key={item.name}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="3"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                    />
                  );
                })}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  ₺{total.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {expenseDetails.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">
                  %{total === 0 ? 0 : ((item.value / total) * 100).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Profesyonel Kâr/Zarar Analizi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trendyol satışlarınızın detaylı analizini yapın, görsel raporlar
            oluşturun ve PDF olarak indirin
          </p>
          <div className="mt-4">
            <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium text-sm">
              Tüm gelir ve maliyetler KDV dahil olarak girilmelidir.
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === "calculator"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-orange-600 hover:bg-gray-50"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Hesaplayıcı</span>
              </button>
              {result && (
                <button
                  onClick={() => setActiveTab("charts")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === "charts"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:text-orange-600 hover:bg-gray-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Grafikler</span>
                </button>
              )}
              {result && (
                <button
                  onClick={() => setActiveTab("report")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === "report"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:text-orange-600 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
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
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Satış ve Maliyet Bilgileri
                  </h2>
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
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">%</span>
                        </div>
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
                        <option value="18">%18</option>
                        <option value="8">%8</option>
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
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Maliyet Bilgileri
                      </h3>
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
                    className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Kâr/Zarar Hesapla
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
                              Komisyon (%{result.commissionRate}):
                            </span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.commission.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">KDV:</span>
                            <span className="text-red-600 font-medium">
                              -₺{result.platformFees.vat.toFixed(2)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartComponent data={result} type="bar" />
            <ChartComponent data={result} type="pie" />
          </div>
        )}

        {activeTab === "report" && result && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Detaylı Analiz Raporu
              </h2>
              <button
                onClick={generatePDF}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
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
                          <span className="text-gray-600">Komisyon:</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.commission.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">KDV:</span>
                          <span className="text-red-600 font-medium">
                            -₺{result.platformFees.vat.toFixed(2)}
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
