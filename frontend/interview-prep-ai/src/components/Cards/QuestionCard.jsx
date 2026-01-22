import React, { useEffect, useState, useRef } from 'react'
import { LuChevronDown, LuPin, LuPinOff, LuSparkles } from 'react-icons/lu'
import AIResponsePreview from '../../pages/InterviewPrep/Component/AIResponsePreview'

const QuestionCard = ({
  question,
  answer,
  onLearnMore,
  isPinned,
  onTogglePin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [height, setHeight] = useState(0)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + 10)
    } else {
      setHeight(0)
    }
  }, [isExpanded])

  const toggleExpand = () => setIsExpanded(!isExpanded)

  return (
    <div className="group bg-white rounded-lg mb-4 overflow-hidden py-4 px-5 shadow-xl shadow-gray-100/70 border border-gray-100/60">
      {/* Header */}
      <div className="flex items-start justify-between cursor-pointer">
        <div className="flex items-start gap-3.5">
          <span className="text-xs md:text-[15px] font-semibold text-gray-400">
            Q
          </span>

          <h3
            className="text-xs md:text-[14px] font-medium text-gray-800 mr-0 md:mr-20"
            onClick={toggleExpand}
          >
            {question}
          </h3>
        </div>

        <div className="flex items-center justify-end ml-4">
          <div
            className={`flex ${
              isExpanded ? 'md:flex' : 'md:hidden group-hover:flex'
            }`}
          >
            {/* Pin Button */}
            <button
              className="flex items-center gap-2 text-xs text-indigo-800 font-medium bg-indigo-50 px-3 py-1 mr-2 rounded border border-indigo-50 hover:border-indigo-200"
              onClick={onTogglePin}
            >
              {isPinned ? <LuPinOff /> : <LuPin />}
            </button>

            {/* Learn More */}
            <button
              className="flex items-center gap-2 text-xs text-cyan-800 font-medium bg-cyan-50 px-3 py-1 mr-2 rounded border border-cyan-50 hover:border-cyan-200"
              onClick={() => {
                setIsExpanded(true)
                onLearnMore()
              }}
            >
              <LuSparkles />
              <span className="hidden md:block">Learn More</span>
            </button>
          </div>

          {/* Expand Icon */}
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={toggleExpand}
          >
            <LuChevronDown
              size={20}
              className={`transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Answer Section */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: `${height}px` }}
      >
        <div
          ref={contentRef}
          className="mt-4 text-gray-700 bg-gray-50 px-5 py-3 rounded-lg text-sm"
        >
          <AIResponsePreview content={answer} />
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
