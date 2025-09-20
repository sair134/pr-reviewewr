import dbConnect from "../apps/next/src/lib/mongodb";
import Plan from "../apps/next/src/models/Plans";

async function seedPlans() {
  await dbConnect();

  const plansData = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying things out",
      features: [
        "30-day free trial",
        "Basic analytics",
        "Email support",
        "Up to 1 project",
      ],
    },
    {
      name: "Pro",
      price: "$19/mo",
      description: "For growing teams and power users",
      features: [
        "Everything in Starter",
        "Unlimited projects",
        "Advanced analytics",
        "Priority email support",
      ],
    },
  ];

  try {
    // Optional: clear existing plans
    await Plan.deleteMany({});
    // Insert new plans
    const insertedPlans = await Plan.insertMany(plansData);
    console.log("Plans seeded successfully!", insertedPlans);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding plans:", err);
    process.exit(1);
  }
}

seedPlans();