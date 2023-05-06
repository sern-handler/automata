(require '[babashka.http-client :as http]
         '[cheshire.core :as json])

(defn latest-version [sern-repo]
  (-> (http/get (str "https://api.github.com/repos/sern-handler/" sern-repo "/tags"))
      :body
      (json/parse-string true)
      first
      :name))
(def versions (mapv latest-version *command-line-args*))

(println (clojure.string/join ", " versions))
