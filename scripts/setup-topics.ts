import { createOperatorClient } from '../src/lib/hedera/client';
import { createTopic } from '../src/lib/hedera/hcs';

async function setupTopics() {
  try {
    const client = createOperatorClient();

    console.log("Creating institution topic...");
    const institutionTopic = await createTopic(client, {
      memo: "Hedera CertChain - Institutions",
    });

    console.log("Creating events topic...");
    const eventsTopic = await createTopic(client, {
      memo: "Hedera CertChain - Certificate Events",
    });

    console.log("Institution Topic ID:", institutionTopic.topicId);
    console.log("Events Topic ID:", eventsTopic.topicId);

    console.log("\nSetup complete! Add these to your .env.local");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setupTopics();
