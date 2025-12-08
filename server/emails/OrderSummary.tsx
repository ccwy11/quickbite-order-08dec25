import { Html, Container, Heading, Text, Section, Hr } from "@react-email/components";

interface OrderSummaryProps {
  order: any;  // Your DB row with mainItems, choices, totalAmount, etc.
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const { mainItems, choices, totalAmount, phone, notes, deliveryWeek } = order;

  return (
    <Html>
      <Container style={{ padding: "20px", fontFamily: "system-ui, sans-serif", backgroundColor: "#f9fafb" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "12px", maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ color: "#00C48C", fontSize: "28px", marginBottom: "8px" }}>
            Weekly Order Confirmed! #{order.id}
          </Heading>
          <Text style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>
            Delivery week starting {new Date(deliveryWeek).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

          {/* Loop through days/items */}
          {mainItems?.map((dayData: any, idx: number) => (
            <Section key={idx} style={{ marginBottom: "24px" }}>
              <Heading as="h2" style={{ fontSize: "20px", color: "#00C48C", marginBottom: "12px" }}>
                {dayData.day}
              </Heading>
              {dayData.items?.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <Text style={{ margin: 0, fontSize: "16px" }}>{item.name} × {item.qty}</Text>
                  <Text style={{ margin: 0, fontWeight: "bold" }}>Rs.{item.price * item.qty}</Text>
                </div>
              ))}
              {/* Choices for this day */}
              <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "12px" }}>
                Snacks: {choices?.[dayData.day]?.snacks || "None"} | 
                Egg: {choices?.[dayData.day]?.egg || "None"} | 
                Appetizer: {choices?.[dayData.day]?.appetizer || "None"}
              </Text>
            </Section>
          ))}

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Section style={{ textAlign: "right", backgroundColor: "#f0fdf4", padding: "20px", borderRadius: "8px" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#00C48C" }}>
              Grand Total: Rs.{totalAmount}
            </Text>
            <Text style={{ fontSize: "14px", color: "#6b7280" }}>
              Phone: {phone} | {notes ? `Notes: "${notes}"` : "No notes"}
            </Text>
          </Section>

          <Text style={{ textAlign: "center", color: "#9ca3af", fontSize: "12px", marginTop: "32px" }}>
            Auto-sent from your kitchen system • View in admin dashboard
          </Text>
        </div>
      </Container>
    </Html>
  );
}