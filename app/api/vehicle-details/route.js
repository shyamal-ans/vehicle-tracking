import axios from "axios";

export async function POST() {
  try {
    // Read JSON body from incoming request (optional if you want dynamic data)
    // const body = await request.json();

    // For now, using static body as per your example
    const body = {
      adminCode: "CUS-UT002",
      projectId: "16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77",
      startDate: "2025-05-10 00:00:00",
      endDate: "2025-05-19 23:59:59",
      pageNo: 1,
      pageSize: 100,
    };

    // Call external API
    const response = await axios.post(
      "http://13.232.146.139:8087/billingservice/admin/vehicle_details",
      body,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Return JSON response
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error.message);

    return new Response(
      JSON.stringify({ error: "Failed to fetch vehicle details" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
