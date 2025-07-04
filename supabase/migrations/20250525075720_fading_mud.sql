/*
  # Add spending insights views and functions

  1. New Views
    - spending_by_category: Aggregates expenses by category
    - user_balances: Calculates amounts owed/owing per user
  
  2. Functions
    - calculate_user_spending: Returns user's spending stats
    - get_top_categories: Returns top spending categories
*/

-- Create view for spending by category
CREATE VIEW spending_by_category AS
SELECT 
  e.category,
  SUM(e.amount) as total_amount,
  COUNT(*) as transaction_count,
  MIN(e.date) as first_transaction,
  MAX(e.date) as last_transaction
FROM expenses e
GROUP BY e.category;

-- Create view for user balances
CREATE VIEW user_balances AS
WITH paid_expenses AS (
  SELECT 
    paid_by as user_id,
    SUM(amount) as total_paid
  FROM expenses
  GROUP BY paid_by
),
owed_amounts AS (
  SELECT 
    user_id,
    SUM(amount) as total_owed
  FROM expense_shares
  WHERE NOT is_paid
  GROUP BY user_id
)
SELECT 
  COALESCE(pe.user_id, oa.user_id) as user_id,
  COALESCE(pe.total_paid, 0) as total_paid,
  COALESCE(oa.total_owed, 0) as total_owed,
  COALESCE(pe.total_paid, 0) - COALESCE(oa.total_owed, 0) as net_balance
FROM paid_expenses pe
FULL OUTER JOIN owed_amounts oa ON pe.user_id = oa.user_id;

-- Function to get user's spending insights
CREATE OR REPLACE FUNCTION get_user_spending_insights(user_id uuid, days_back integer)
RETURNS TABLE (
  category text,
  total_amount numeric,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_expenses AS (
    SELECT 
      e.category,
      SUM(e.amount) as amount
    FROM expenses e
    WHERE 
      e.date >= NOW() - (days_back || ' days')::interval
      AND e.paid_by = user_id
    GROUP BY e.category
  ),
  total AS (
    SELECT SUM(amount) as total FROM user_expenses
  )
  SELECT 
    ue.category,
    ue.amount as total_amount,
    ROUND((ue.amount / NULLIF(t.total, 0) * 100)::numeric, 2) as percentage
  FROM user_expenses ue
  CROSS JOIN total t
  ORDER BY ue.amount DESC;
END;
$$ LANGUAGE plpgsql;