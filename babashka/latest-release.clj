(require '[clojure.java.shell :refer [sh]]
         '[cheshire.core :as json])

(defn latest-version [sern-repo]
  (-> (sh "curl" (str "https://api.github.com/repos/sern-handler/" sern-repo "/tags"))
      :out
      (json/parse-string true)
      first
      :name))
(def versions (mapv latest-version *command-line-args*))

(println (clojure.string/join ", " versions))
