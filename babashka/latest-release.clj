(require '[babashka.http-client :as http]
         '[cheshire.core :as json])

(def token (get env "GHTOKEN"))

(defn latest-version [sern-repo]
  (-> (http/get 
        (str "https://api.github.com/repos/sern-handler/" sern-repo "/tags") 
        {:headers 
         {"Accept" "application/vnd.github+json"}
         {"X-GitHub-Api-Version" "2022-11-28"}
         {"Authorization" (str "Bearer " token)}
         }
        )
      :body
      (json/parse-string true)
      first
      :name))
(def versions (mapv latest-version *command-line-args*))

(println (clojure.string/join ", " versions))
