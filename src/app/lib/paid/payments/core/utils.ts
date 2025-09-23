export async function getOrganizationId(paidApiUrl: string, paidApiKey: string): Promise<string | null> {
  try {
    const orgResponse = await fetch(`${paidApiUrl}/api/organizations/organizationId`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paidApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orgResponse.ok) {
      console.error('Failed to get orgId:', await orgResponse.text());
      return null;
    }

    const orgData = await orgResponse.json();
    return orgData.data?.organizationId || null;
  } catch (error) {
    console.error('Error fetching organization ID:', error);
    return null;
  }
}

