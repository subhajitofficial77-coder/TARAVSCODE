const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function triggerContentGeneration(seed: any) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/content-generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      seed,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Content generation failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.data;
}

export async function initializeCreativeStudio() {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Initialization failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function refreshMasterPlan() {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/daily-master-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Master plan refresh failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}