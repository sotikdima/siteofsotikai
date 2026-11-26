export function formatRubles(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isValidYooMoneyWallet(wallet: string): boolean {
  const clean = wallet.trim().replace(/\s+/g, '');
  // Standard YooMoney account is 14-16 digits, commonly starting with 41001
  return /^\d{14,16}$/.test(clean);
}

export function getPaymentReturnUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('payment', 'success');
    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
}

export function buildYooMoneyDirectLink(wallet: string, amount: number, comment?: string): string {
  const cleanWallet = wallet.trim().replace(/\s+/g, '');
  const cleanComment = comment ? comment.trim().replace(/\s+/g, ' ').slice(0, 140) : '';
  const params = new URLSearchParams({
    receiver: cleanWallet,
    'quickpay-form': 'shop',
    sum: amount.toString(),
    targets: cleanComment ? `Донат: ${cleanComment.slice(0, 110)}` : 'Поддержка проекта СайтСотика',
  });
  if (cleanComment) {
    params.set('comment', cleanComment);
    params.set('formcomment', cleanComment.slice(0, 50));
    params.set('short-dest', cleanComment.slice(0, 50));
  }
  const returnUrl = getPaymentReturnUrl();
  if (returnUrl) {
    params.set('successURL', returnUrl);
  }
  return `https://yoomoney.ru/quickpay/confirm?${params.toString()}`;
}

export const YOOKASSA_WORKER_URL = 'https://yoomoney-donations.sotikdima.workers.dev';

export interface CreateYooKassaPaymentParams {
  amount: number;
  name?: string;
  message?: string;
  returnUrl?: string;
}

export interface CreateYooKassaPaymentResult {
  confirmationUrl: string;
  paymentId: string;
}

export async function createYooKassaPayment(
  params: CreateYooKassaPaymentParams
): Promise<CreateYooKassaPaymentResult> {
  const resolvedReturnUrl = params.returnUrl || getPaymentReturnUrl();
  const payload = {
    amount: Number(params.amount),
    name: (params.name || '').trim() || 'Зритель СайтСотика',
    message: (params.message || '').trim() || 'Поддержка стрима',
    ...(resolvedReturnUrl ? { returnUrl: resolvedReturnUrl } : {}),
  };

  const tryEndpoint = async (url: string): Promise<CreateYooKassaPaymentResult> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`NON_JSON_${res.status}`);
    }

    const data = (await res.json()) as Partial<CreateYooKassaPaymentResult> & { error?: string };
    if (!res.ok || !data.confirmationUrl) {
      throw new Error(data.error || `Ошибка создания платежа (${res.status})`);
    }

    return {
      confirmationUrl: data.confirmationUrl,
      paymentId: data.paymentId || '',
    };
  };

  try {
    return await tryEndpoint('/api/yookassa/create-payment');
  } catch (proxyErr) {
    const msg = proxyErr instanceof Error ? proxyErr.message : '';
    // Fallback to direct worker call when hosted statically without Express proxy
    if (msg.startsWith('NON_JSON_') || msg === 'Failed to fetch') {
      return await tryEndpoint(`${YOOKASSA_WORKER_URL}/createPayment`);
    }
    throw proxyErr;
  }
}

