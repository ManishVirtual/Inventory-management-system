import React, { useState, useEffect, useContext } from "react";
import AddPurchaseDetails from "../components/AddPurchaseDetails";
import AuthContext from "../AuthContext";
import { FiDownload } from "react-icons/fi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchase, setAllPurchaseData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const doc = new jsPDF();

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchPurchaseData();
    fetchProductsData();
  }, [updatePage]);

  // Fetching Data of All Purchase items
  const fetchPurchaseData = () => {
    fetch(`http://localhost:4000/api/purchase/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllPurchaseData(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setPurchaseModal(!showPurchaseModal);
  };

  
  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };


  // Download purchase details
  const toggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
  };

  const currentDate = new Date().toLocaleDateString();
  const exportPDF = () => {
    doc.autoTable({html:'#purchaseDetails'});
    doc.save(`purchase-details_${currentDate}`);
  };

  // download CSV file
  const exportCSV = () => {
    const headers = Array.from(document.querySelectorAll("#purchaseDetails th"))
      .map(th => th.textContent.trim());
    
    const rows = purchase.map(item => {
      return [
        item.ProductID.name,
        item.QuantityPurchased,
        item.PurchaseDate,
        item.TotalPurchaseAmount
      ];
    });

    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase-details_${currentDate}.csv`);
    document.body.appendChild(link);

    // Trigger download
    link.click();
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
            authContext = {authContext}
          />
        )}
        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Purchase Details</span>
            </div>
            <div className="flex gap-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
        onClick={addSaleModalSetting}
      >
        Add Purchase
      </button>
      <div className="relative">
        <button
          className="font-bold p-2 text-lg hover:text-blue-700 rounded"
          title="Download purchase details"
          onClick={toggleExportOptions}
        >
          <FiDownload/>
        </button>
        
      </div>

    </div>
          {showExportOptions && (
          <div className="absolute right-16 mt-10 bg-white shadow-md rounded border">
            <button
              className=" block px-2 py-1 text-xs border-b-2 text-black hover:bg-gray-200"
              onClick={exportPDF}
            >
              Export PDF
            </button>
            <button
              className=" block px-2 py-1 text-xs text-black hover:bg-gray-200"
              onClick={exportCSV}
            >
              Export CSV
            </button>
          </div>
        )}
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Product Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Quantity Purchased
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Purchase Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Total Purchase Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {purchase.map((element, index) => {
                return (
                  <tr key={element._id}>
                    <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                      {element.ProductID?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.QuantityPurchased}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {new Date(element.PurchaseDate).toLocaleDateString() ==
                      new Date().toLocaleDateString()
                        ? "Today"
                        : element.PurchaseDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      ${element.TotalPurchaseAmount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* pdf download format containing actual date instead of Today */}
          <table id="purchaseDetails" className="invisible min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Product Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Quantity Purchased
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Purchase Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Total Purchase Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {purchase.map((element, index) => {
                return (
                  <tr key={element._id}>
                    <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                      {element.ProductID?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.QuantityPurchased}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.PurchaseDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      ${element.TotalPurchaseAmount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default PurchaseDetails;
