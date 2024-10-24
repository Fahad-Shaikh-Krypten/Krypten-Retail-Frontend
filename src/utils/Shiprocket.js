import axios from 'axios';

export function generateSKU(product) {
    const { category, productId } = product;


    const categoryCode = category ? category.substring(0, 3).toUpperCase() : "GEN";

    const idCode = productId ? productId.toString().slice(-4) : "0000";

    return `${categoryCode}-${idCode}`;
}




export async function authenticateShiprocket() {

 
    const credentials = {
        email: import.meta.env.VITE_SHIPROCKET_EMAIL,
        password: import.meta.env.VITE_SHIPROCKET_PASSWORD,
    };

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', credentials);
        const token = response.data.token;
        return token;
    } catch (error) {
        console.error("Error authenticating with Shiprocket:", error);
    }
}



export async function createShiprocketOrder(orderDetails) {
    const token = await authenticateShiprocket();
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const orderData = {
        order_id: orderDetails.orderId,
        order_date: orderDetails.orderDate,
        pickup_location: "Warehouse 1",
        billing_customer_name: orderDetails.customerName,
        billing_address: orderDetails.billingAddress,
        billing_city: orderDetails.billingCity,
        billing_pincode: orderDetails.billingPincode,
        billing_state: orderDetails.billingState,
        billing_country: orderDetails.billingCountry,
        billing_email: orderDetails.customerEmail,
        billing_phone: orderDetails.customerPhone,
        shipping_is_billing: true,
        order_items: [
            {
                name: orderDetails.productName,
                sku: orderDetails.productSKU,
                units: orderDetails.quantity,
                selling_price: orderDetails.sellingPrice,
                discount: orderDetails.discount,
                tax: orderDetails.tax
            }
        ],
        payment_method: orderDetails.paymentMethod, // 'Prepaid' or 'COD'
        sub_total: orderDetails.subTotal,
        length: orderDetails.length,   // dimensions of the package
        breadth: orderDetails.breadth,
        height: orderDetails.height,
        weight: orderDetails.weight
    };

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', orderData, config);
        return response.data;
    } catch (error) {
        console.error("Error creating Shiprocket order:", error);
    }
}


export const checkCourierServiceability = async ( deliveryPostcode, weight) => {
    try {
      const token = await authenticateShiprocket();
      const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
        params: {
          pickup_postcode: "400011",
          delivery_postcode: deliveryPostcode,
          weight: weight,
          cod:1
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const availableCouriers = response.data.data?.available_courier_companies || [];
      return Array.isArray(availableCouriers) && availableCouriers.length > 0;
    } catch (error) {
      console.error('Error checking courier serviceability:', error);
      throw error;
    }
  };
  
  export async function getShippingRatesForOrder(orderDetails) {
    console.log(orderDetails)
    const token = await authenticateShiprocket();

    // Aggregate shipment details
    const totalWeight = orderDetails.products.reduce((total, product) => total + (product.weight * product.quantity), 0);
    const maxLength = Math.max(...orderDetails.products.map(product => product.dimensions.length));
    const maxBreadth = Math.max(...orderDetails.products.map(product => product.dimensions.breadth));
    const maxHeight = Math.max(...orderDetails.products.map(product => product.dimensions.height));

    const shipmentDetails = {
        pickupPostcode: "400011",  // Your pickup location's postal code
        deliveryPostcode: orderDetails.deliveryPincode,
        weight: totalWeight,  // Total weight of all products
        length: maxLength,    // Max dimension of the package
        breadth: maxBreadth,
        height: maxHeight,
        isCOD: orderDetails.paymentMethod === 'COD'
    };

    // Get shipping rates from Shiprocket
    const shippingRates = await getShippingRates(token, shipmentDetails);

    // Example: Selecting the cheapest shipping option
    const cheapestOption = shippingRates.data.available_courier_companies.reduce((prev, curr) => 
        prev.rate < curr.rate ? prev : curr
    );

    const shippingCharge = cheapestOption.rate;

    return {
        shippingCharge,
        courierCompany: cheapestOption.courier_name
    };
}


