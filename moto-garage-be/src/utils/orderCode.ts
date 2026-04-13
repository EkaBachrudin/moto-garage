import { query } from '../config/database';

/**
 * Generate a unique order code in format: ORD-YYYYMMDD-XXXX
 * Where XXXX is a 4-digit sequence number for that day
 *
 * Example: ORD-20250413-0001
 */
export async function generateOrderCode(): Promise<string> {
  // Get current date in YYYYMMDD format (local time)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Find the last order code for today
  const result = await query(
    `SELECT order_code
     FROM service_orders
     WHERE order_code LIKE 'ORD-${dateStr}-%'
     ORDER BY order_code DESC
     LIMIT 1`
  );

  let sequence = 1;

  if (result.rows.length > 0) {
    // Extract sequence number from last order code
    const lastCode = result.rows[0].order_code;
    const lastSequence = parseInt(lastCode.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format sequence as 4-digit number with leading zeros
  const sequenceStr = String(sequence).padStart(4, '0');

  return `ORD-${dateStr}-${sequenceStr}`;
}
