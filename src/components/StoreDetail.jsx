import { Phone } from 'lucide-react'
import { getStatusColor } from '../utils/statusColor'
import { formatRelativeDate } from '../utils/formatDate'

export default function StoreDetail({ store }) {
  if (!store) return null

  const { color, label, bgColor } = getStatusColor(store.pbios)
  const sorted = [...(store.pbios ?? [])].sort((a, b) => b.regDttm - a.regDttm)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color, background: bgColor }}
        >
          {label}
        </span>
        <h2 className="text-[17px] font-semibold text-[#191F28] mt-2 leading-snug">
          {store.comName}
        </h2>
        <p className="text-[14px] text-[#4E5968] mt-0.5">{store.address}</p>
      </div>

      {store.telNum && (
        <a
          href={`tel:${store.telNum}`}
          className="flex items-center gap-2 text-[14px] text-[#3182F6] font-medium"
        >
          <Phone className="w-4 h-4" />
          {store.telNum}
        </a>
      )}

      <div>
        <p className="text-[13px] font-semibold text-[#191F28] mb-2">최근 입고 현황</p>
        {sorted.length > 0 ? (
          <div className="flex flex-col">
            {sorted.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[13px] py-2 border-b border-[#F2F4F6] last:border-0"
              >
                <span className="text-[#191F28]">
                  {item.pcdName} {item.piName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#4E5968]">{item.quantity?.toLocaleString()}개</span>
                  <span className="text-[12px] text-[#8B95A1]">
                    {formatRelativeDate(item.regDttm)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#8B95A1]">최근 입고 내역이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
