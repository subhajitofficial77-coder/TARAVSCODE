export type WorkflowStatus = {
  id: string;
  status: 'running' | 'success' | 'error';
  message?: string;
  data?: any;
};

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function triggerDailyAwakening(options?: { force?: boolean }) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/daily-awakening`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      force_regenerate: options?.force || false
    })
  });

  if (!response.ok) {
    throw new Error(`Daily awakening failed: ${response.status}`);
  }

  return response.json();
}

export async function generateContentFromSeed(
  seedId: string,
  platform: string,
  contentType: string
) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/generate-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seed_id: seedId,
      platform,
      content_type: contentType,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Content generation failed: ${response.status}`);
  }

  return response.json();
}

export async function publishToSocialMedia(contentId: string, platforms: string[]) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/publish-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_id: contentId,
      platforms,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Publishing failed: ${response.status}`);
  }

  return response.json();
}

export async function checkWorkflowStatus(executionId: string): Promise<WorkflowStatus> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(`${N8N_WEBHOOK_URL}/status/${executionId}`, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`);
  }

  return response.json();
}

// Helper type for workflow responses
export interface N8NResponse<T = any> {
  success: boolean;
  executionId?: string;
  data?: T;
  error?: string;
}