export interface ShipmentRequest {
    orderId: string;
    items: any[];
    address: {
        full_name: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
}

export interface ShipmentResponse {
    success: boolean;
    trackingId: string | null;
    courierName: string | null;
    estimatedDelivery: string | null;
    error: string | null;
}

/**
 * Dummy Shipping Integration System
 * Replace this with actual provider (Shiprocket, Delhivery, etc.) once verified.
 */
export async function createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    console.log('[Shipping] Initiating shipment creation for order:', request.orderId);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dummy logic
    const couriers = ['Delhivery Express', 'BlueDart', 'Ecom Express', 'Trackon'];
    const randomCourier = couriers[Math.floor(Math.random() * couriers.length)];
    const trackingId = `AWB${Math.floor(Math.random() * 10000000000)}`;

    const daysToAdd = Math.floor(Math.random() * 3) + 3;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

    console.log('[Shipping] Success! AWB:', trackingId, 'via', randomCourier);

    return {
        success: true,
        trackingId,
        courierName: randomCourier,
        estimatedDelivery: deliveryDate.toISOString(),
        error: null,
    };
}
