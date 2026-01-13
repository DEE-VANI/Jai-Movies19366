import { Film, Github, Twitter } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-950 rounded-full flex items-center justify-center">
                <Film className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            About JAI Movies
          </h1>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">What is This?</h2>
            <p className="text-lg leading-relaxed">
              JAI Movies is a personal cinema journal and review platform. It's a space to
              document honest emotional reactions to the films and TV series that matter. Not
              formal criticism, not spoiler-filled reviews—just authentic responses to
              storytelling that moves us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">The Vision</h2>
            <p className="text-lg leading-relaxed mb-4">
              Every movie and series leaves an impression. This platform captures those
              impressions in real-time—the emotions, the themes, the moments that stuck with us.
              It's a record of how cinema affects us, how stories shape our perspective, and why
              certain films stay with us long after the credits roll.
            </p>
            <p className="text-lg leading-relaxed">
              Whether it's a blockbuster, an indie gem, or a binge-worthy series, every watch
              deserves a thoughtful reflection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Features</h2>
            <ul className="space-y-3 text-lg">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 font-bold">•</span>
                <span>5-star rating system with community feedback</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 font-bold">•</span>
                <span>Detailed reviews with short summaries and full reactions</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 font-bold">•</span>
                <span>Image gallery (up to 10 images per review)</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 font-bold">•</span>
                <span>Genre filtering and search across reviews</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 font-bold">•</span>
                <span>Easy sharing to Twitter with formatted previews</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 font-bold">•</span>
                <span>Featured reviews highlighted on the homepage</span>
              </li>
            </ul>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Connect</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href="https://github.com/DEE-VANI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 border border-gray-800 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://x.com/JaiMovies19366"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 border border-gray-800 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter/X</span>
              </a>
            </div>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500 italic text-lg">
              "Cinema is a mirror by which we often see ourselves. These are just reflections."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
