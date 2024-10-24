import { useState, useEffect } from "react";
import { FaTruck } from "react-icons/fa";
import { VscPackage } from "react-icons/vsc";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { encryptData, decryptData } from "../utils/Encryption";
import "../styles/TrackingPage.css"; // Import your custom CSS
import toast from "react-hot-toast";

export default function TrackingPage() {
  const [trackingData, setTrackingData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { shiprocketOrderId } = location.state || {};

  const getTrackingData = async () => {
    try {
      const encryptedData = encryptData(JSON.stringify(shiprocketOrderId));
      const encryptedResponse = await axios.post(
        `${import.meta.env.VITE_SERVER}/order/track`,
        { encryptedData }
      );
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const parsedData = JSON.parse(decryptedResponse);
      setTrackingData(parsedData[shiprocketOrderId]);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    }
  };

  useEffect(() => {
    getTrackingData();
  }, []);

  if (trackingData && Object.keys(trackingData).length !== 0 && trackingData?.tracking_data?.error) {
    toast.error(trackingData.tracking_data.error);
    navigate('/Profile', { state: 'myOrders' });
  }

  const shipmentTrack = trackingData?.tracking_data?.shipment_track?.[0];
  const activities = trackingData?.tracking_data?.shipment_track_activities;

  if (!shipmentTrack) {
    // Display a default message when tracking data is not available
    return (
      <div className="tracking-container">
        <h1 className="tracking-title">Order Tracking</h1>
        <div className="tracking-card">
          <div className="tracking-card-content">
            <p>The order has been placed, but tracking information is not yet available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-container">
      <h1 className="tracking-title">Order Tracking</h1>
      <div className="tracking-card">
        <div className="tracking-card-header">
          <h2 className="tracking-card-title">Shipment Details</h2>
        </div>
        <div className="tracking-card-content">
          <div className="tracking-grid">
            <div className="tracking-grid-item">
              <p className="tracking-label">Order ID:</p>
              <p>{shipmentTrack.order_id}</p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">AWB Code:</p>
              <p>{shipmentTrack.awb_code}</p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Courier:</p>
              <p>{shipmentTrack.courier_name}</p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Current Status:</p>
              <span
                className={`tracking-badge ${
                  shipmentTrack.current_status === "Delivered"
                    ? "tracking-success"
                    : "tracking-default"
                }`}
              >
                {shipmentTrack.current_status}
              </span>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Origin:</p>
              <p>{shipmentTrack.origin}</p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Destination:</p>
              <p>{shipmentTrack.destination}</p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Expected Delivery Date:</p>
              <p>
                {shipmentTrack.edd
                  ? new Date(shipmentTrack.edd).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long", // This will show the month as a word (e.g., January)
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Pickup Date:</p>
              <p>
                {shipmentTrack.pickup_date
                  ? new Date(shipmentTrack.pickup_date).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long", // This will show the month as a word (e.g., January)
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="tracking-grid-item">
              <p className="tracking-label">Delivered Date:</p>
              <p>
                {shipmentTrack.delivered_date
                  ? new Date(shipmentTrack.delivered_date).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long", // This will show the month as a word (e.g., January)
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="tracking-grid-item">
              <a
                href={trackingData.tracking_data.track_url}
                target="_blank"
                rel="noopener noreferrer"
                className="track-url-button"
              >
                View Full Tracking Details
              </a>
            </div>
          </div>
        </div>
      </div>

      {activities && activities.length > 0 ? (
        <div className="tracking-card">
          <div className="tracking-card-header">
            <h2 className="tracking-card-title">Tracking History</h2>
          </div>
          <div className="tracking-card-content">
            <div className="tracking-activity-list">
              {activities.map((activity, index) => (
                <div key={index} className="tracking-activity-item">
                  <div className="tracking-icon">
                    {index === 0 ? (
                      <VscPackage className="tracking-icon-svg" />
                    ) : (
                      <FaTruck className="tracking-icon-svg" />
                    )}
                  </div>
                  <div className="tracking-activity-details">
                    <p className="tracking-activity-status">
                      {activity["sr-status-label"]}
                    </p>
                    <p className="tracking-activity-date">
                      {activity.date
                        ? `${new Date(activity.date).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })} ${new Date(activity.date).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}`
                        : "N/A"}
                    </p>
                    <p className="tracking-activity-description">
                      {activity.activity}
                    </p>
                    <p className="tracking-activity-location">
                      {activity.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // If no activities are available, show the default activity for order placed
        <div className="tracking-card">
          <div className="tracking-card-header">
            <h2 className="tracking-card-title">Tracking History</h2>
          </div>
          <div className="tracking-card-content">
            <div className="tracking-activity-list">
              <div className="tracking-activity-item">
                <div className="tracking-icon">
                  <VscPackage className="tracking-icon-svg" />
                </div>
                <div className="tracking-activity-details">
                  <p className="tracking-activity-status">Order Placed</p>
                  <p className="tracking-activity-date">
                    {new Date().toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="tracking-activity-description">
                    Your order has been placed successfully.
                  </p>
                  <p className="tracking-activity-location">N/A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
