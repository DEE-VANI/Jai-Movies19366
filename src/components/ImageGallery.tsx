import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        <div
          className="aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[selectedIndex]}
            alt={`Gallery image ${selectedIndex + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 overflow-x-auto px-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedIndex
                      ? 'border-cyan-500'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {selectedIndex + 1} / {images.length}
        </p>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-900/80 hover:bg-gray-800 rounded-lg text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                goToPrevious();
              }}
              className="absolute left-4 p-2 bg-gray-900/80 hover:bg-gray-800 rounded-lg text-white z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={images[selectedIndex]}
              alt={`Full view ${selectedIndex + 1}`}
              className="max-w-4xl max-h-screen object-contain"
            />

            <button
              onClick={() => {
                goToNext();
              }}
              className="absolute right-4 p-2 bg-gray-900/80 hover:bg-gray-800 rounded-lg text-white z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
