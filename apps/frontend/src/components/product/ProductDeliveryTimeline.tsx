import { useMemo } from 'react';
import { ShoppingBag, Truck, MapPin } from 'lucide-react';

interface ProductDeliveryTimelineProps {
  className?: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function formatTimelineDate(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function ProductDeliveryTimeline({ className = '' }: ProductDeliveryTimelineProps) {
  // Dynamically calculate estimated delivery dates based on current day
  const { orderedDate, orderReadyDate, deliveredDate } = useMemo(() => {
    const today = new Date();

    const readyStart = new Date(today);
    readyStart.setDate(today.getDate() + 1);

    const readyEnd = new Date(today);
    readyEnd.setDate(today.getDate() + 3);

    const delivStart = new Date(today);
    delivStart.setDate(today.getDate() + 4);

    const delivEnd = new Date(today);
    delivEnd.setDate(today.getDate() + 7);

    return {
      orderedDate: formatTimelineDate(today),
      orderReadyDate: `${formatTimelineDate(readyStart)} - ${formatTimelineDate(readyEnd)}`,
      deliveredDate: `${formatTimelineDate(delivStart)} - ${formatTimelineDate(delivEnd)}`,
    };
  }, []);

  return (
    <div
      className={`w-full my-7 py-5 border-y border-[#ddd3c5]/70 select-none ${className}`}
      aria-label="Order and delivery estimated timeline"
    >
      <div className="relative w-full">
        {/* Connecting horizontal lines between circular icon badges */}
        {/* Line 1: Ordered -> Order Ready */}
        <div
          className="absolute top-[22px] sm:top-[24px] left-[calc(16.67%+28px)] right-[calc(50%+28px)] h-[2.5px] bg-[#171717] -translate-y-1/2 z-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Line 2: Order Ready -> Delivered */}
        <div
          className="absolute top-[22px] sm:top-[24px] left-[calc(50%+28px)] right-[calc(16.67%+28px)] h-[2.5px] bg-[#171717] -translate-y-1/2 z-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* 3 Step Badges & Details */}
        <div className="grid grid-cols-3 w-full">
          {/* Step 1: Ordered */}
          <div className="flex flex-col items-center text-center z-10 px-1">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform hover:scale-105"
              title="Order placed"
            >
              <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="mt-2.5 sm:mt-3 text-[12px] sm:text-[13px] font-bold text-[#171717] tracking-tight leading-tight">
              Ordered
            </span>
            <span
              className="mt-1 text-[11px] sm:text-[12px] text-[#171717] font-medium underline decoration-dotted decoration-1 underline-offset-[3px]"
              title={`Ordered on ${orderedDate}`}
            >
              {orderedDate}
            </span>
          </div>

          {/* Step 2: Order Ready */}
          <div className="flex flex-col items-center text-center z-10 px-1">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform hover:scale-105"
              title="Order handcrafted and packed"
            >
              <Truck className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="mt-2.5 sm:mt-3 text-[12px] sm:text-[13px] font-bold text-[#171717] tracking-tight leading-tight">
              Order Ready
            </span>
            <span
              className="mt-1 text-[11px] sm:text-[12px] text-[#171717] font-medium underline decoration-dotted decoration-1 underline-offset-[3px]"
              title={`Dispatched between ${orderReadyDate}`}
            >
              {orderReadyDate}
            </span>
          </div>

          {/* Step 3: Delivered */}
          <div className="flex flex-col items-center text-center z-10 px-1">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform hover:scale-105"
              title="Estimated doorstep delivery"
            >
              <MapPin className="w-5 h-5 text-white fill-white stroke-[#171717]" strokeWidth={1.5} />
            </div>
            <span className="mt-2.5 sm:mt-3 text-[12px] sm:text-[13px] font-bold text-[#171717] tracking-tight leading-tight">
              Delivered
            </span>
            <span
              className="mt-1 text-[11px] sm:text-[12px] text-[#171717] font-medium underline decoration-dotted decoration-1 underline-offset-[3px]"
              title={`Expected delivery ${deliveredDate}`}
            >
              {deliveredDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
