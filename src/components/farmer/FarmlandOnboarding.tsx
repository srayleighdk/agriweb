'use client';

import { useState } from 'react';
import { MapPin, ArrowRight, X, Map, Sprout, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FarmlandOnboardingProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function FarmlandOnboarding({ onClose, onComplete }: FarmlandOnboardingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Chào mừng đến với AgriWeb! 🌾',
      description: 'Chúng tôi sẽ giúp bạn thiết lập trang trại của mình trong vài bước đơn giản',
      icon: Sprout,
      image: '🎉',
    },
    {
      title: 'Thêm đất canh tác của bạn',
      description: 'Đánh dấu vị trí trang trại trên bản đồ để chúng tôi hiểu rõ hơn về đất đai của bạn',
      icon: MapPin,
      image: '🗺️',
    },
    {
      title: 'Quản lý cây trồng & vật nuôi',
      description: 'Sau khi thêm đất, bạn có thể theo dõi cây trồng, vật nuôi và nhật ký canh tác',
      icon: CheckCircle,
      image: '🌱',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to create farmland with map selection
      router.push('/farmer/farmlands/new?step=map');
      onComplete();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="text-center">
            <div className="text-7xl mb-4">{step.image}</div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Icon size={32} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-12 bg-green-600'
                    : index < currentStep
                    ? 'w-8 bg-green-400'
                    : 'w-8 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Features Preview for Current Step */}
          {currentStep === 1 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-xl">
                  <Map className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Chọn vị trí trên bản đồ</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn sẽ được chuyển đến trang tạo đất canh tác với công cụ chọn vị trí trên bản đồ.
                    Chỉ cần nhấp vào vị trí trang trại của bạn!
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                      <span>Đánh dấu chính xác vị trí trang trại</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                      <span>Nhập thông tin diện tích và loại đất</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                      <span>Thêm thông tin về nguồn nước và điện</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Quay lại
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Map size={20} />
                  Bắt đầu thêm đất
                </>
              ) : (
                <>
                  Tiếp tục
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Bỏ qua hướng dẫn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
