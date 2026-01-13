import { Film } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
              <Film className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            About This Journal
          </h1>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              The Purpose
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              This is not a review site. It's not about star ratings, plot summaries, or
              technical critiques. This is a personal cinema journal—a space to document
              the emotional and thematic impact of movies and TV series I watch.
            </p>
            <p className="text-lg leading-relaxed">
              Each entry is a reflection: honest, thoughtful, and focused on how these
              stories made me feel and what they made me think about.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              What You'll Find Here
            </h2>
            <ul className="space-y-3 text-lg">
              <li className="flex items-start">
                <span className="text-gray-500 mr-3">•</span>
                <span>Personal reactions (100–150 words) to movies and series</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-3">•</span>
                <span>Focus on emotions, themes, and personal impact</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-3">•</span>
                <span>No spoilers, no formal criticism</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-3">•</span>
                <span>A chronological record of my viewing journey</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              The Approach
            </h2>
            <p className="text-lg leading-relaxed">
              Every piece of cinema leaves an impression. This journal captures those
              impressions in their rawest form—not as polished reviews, but as
              immediate, genuine responses to stories that moved me, challenged me,
              or simply made me think differently.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-800">
            <p className="text-center text-gray-500 italic">
              "Cinema is a mirror by which we often see ourselves."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
