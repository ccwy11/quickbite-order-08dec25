// src/emails/OrderSummary.tsx

import { Html, Container, Heading, Text, Section, Hr } from "@react-email/components";
import { format } from "date-fns";

// 1. Replace all :any with this exact interface
interface OrderFromDB {
  id: number;
  deliveryWeek: string | Date;
  totalAmount: number;
  phone: string;
  notes: string | null;
  mainItems: { day: string; items: { name: string; qty: number; price: number }[] }[];
  choices: Record<
    string,
    { snacks: string; egg: string; appetizer: string }
  >;
}

// 2. Use it here – no more :any!
export default function OrderSummary({ order }: { order: OrderFromDB }) {
  const { mainItems, choices, totalAmount, phone, notes, deliveryWeek } = order;

  return (
    <Html>
      <Container style={{ padding: "20px", fontFamily: "system-ui, sans-serif", backgroundColor: "#f9fafb" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "12px", maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ color: "#00C48C", fontSize: "28px", marginBottom: "8px" }}>
            Weekly Order Confirmed! #{order.id}
          </Heading>
          <Text style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>
            Delivery week starting {format(new Date(deliveryWeek), "EEEE, dd MMMM yyyy")}
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

          {mainItems.map((dayData, idx) => (
            <Section key={idx} style={{ marginBottom: "32px" }}>
              <Heading as="h2" style={{ fontSize: "20px", color: "#00C48C", marginBottom: "12px" }}>
                {dayData.day}
              </Heading>

              {dayData.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <Text style={{ margin: 0 }}>{item.name} × {item.qty}</Text>
                  <Text style={{ margin: 0, fontWeight: "bold" }}>Rs.{item.price * item.qty}</Text>
                </div>
              ))}

              <Text style={{ marginTop: "12px", color: "#059669", fontWeight: "500" }}>
                Snacks: {choices[dayData.day]?.snacks || "None"} •{" "}
                Egg: {choices[dayData.day]?.egg || "None"} •{" "}
                Appetizer: {choices[dayData.day]?.appetizer || "None"}
              </Text>
            </Section>
          ))}

          <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

          <div style={{ textAlign: "right" }}>
            <Text style={{ fontSize: "28px", fontWeight: "bold", color: "#00C48C" }}>
              Total: Rs.{totalAmount}
            </Text>
            <Text style={{ color: "#6b7280" }}>
              Phone: {phone} {notes && `• Note: "${notes}"`}
            </Text>
          </div>

          <Text style={{ textAlign: "center", color: "#9ca3af", fontSize: "12px", marginTop: "40px" }}>
            Auto-sent • View in admin dashboard
          </Text>
        </div>
      </Container>
    </Html>
  );
}