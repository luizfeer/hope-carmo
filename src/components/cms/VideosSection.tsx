import Image from 'next/image';
import { Play } from 'lucide-react';
import { getPublishedVideos } from '@/lib/cms/queries';
import { youtubeThumbnailFromUrl } from '@/lib/youtube';
import type { VideoItem } from '@/types/cms';

function VideoGrid({ items }: { items: VideoItem[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((video) => {
        const thumb =
          video.thumb_url?.trim() ||
          youtubeThumbnailFromUrl(video.video_url) ||
          '/img/thumb4.webp';

        return (
          <a
            key={video.id}
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden rounded-2xl mb-4">
              <Image
                src={thumb}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <Play className="h-6 w-6 text-white" fill="currentColor" />
                </div>
              </div>
              {video.duration && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                  {video.duration}
                </div>
              )}
            </div>

            <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors leading-tight">
              {video.title}
            </h3>
          </a>
        );
      })}
    </div>
  );
}

export async function VideosSection() {
  const items = await getPublishedVideos();

  return (
    <section className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            VÍDEOS
          </h2>
          <p className="text-xl text-white/60 font-light">
            Reviva os melhores momentos dos encontros do Hope Carmo
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-white/40 text-lg">Vídeos em breve.</p>
        ) : (
          <VideoGrid items={items} />
        )}

        <div className="text-center mt-16">
          <a
            href="https://www.youtube.com/@HopeCarmo/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            Ver todos no YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
