type RevenueInsight = {
    period: string;
    amount: number;
    formattedAmount: string;
    message: string;
  };
  
  export function getTopRevenueInsight(
    monthlyRevenue: number[],
    revenueLabels: string[]
  ): RevenueInsight | null {
    if (
      !monthlyRevenue ||
      !revenueLabels ||
      monthlyRevenue.length === 0 ||
      monthlyRevenue.length !== revenueLabels.length
    ) {
      return null;
    }
  
    let maxIndex = 0;
  
    for (let i = 1; i < monthlyRevenue.length; i++) {
      if (monthlyRevenue[i] > monthlyRevenue[maxIndex]) {
        maxIndex = i;
      }
    }
  
    const amount = monthlyRevenue[maxIndex];
    if (amount <= 0) return null;
  
    const period = revenueLabels[maxIndex];
    const formattedAmount = `$${amount.toLocaleString()}`;
  
    return {
      period,
      amount,
      formattedAmount,
      message: `You earned the most in ${period}`,
    };
  }
  