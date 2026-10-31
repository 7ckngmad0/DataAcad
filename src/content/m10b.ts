import type { Lesson } from '../types.ts';
import { md } from './md.ts';
import { ISLP, SKL } from './m10a.ts';

export const m10b: Lesson[] = [
  {
    id: 'ml-clustering',
    title: 'Unsupervised Learning: K-Means & Hierarchical Clustering',
    minutes: 45,
    difficulty: 'intermediate',
    widgets: ['kmeans'],
    objectives: [
      'Explain the k-means algorithm (assign → update) and its objective (inertia)',
      'Choose k with the elbow method and silhouette scores',
      'Explain agglomerative hierarchical clustering, linkage methods and dendrograms',
      'Profile and name clusters for business use',
    ],
    intro: md`
Without labels, can we still find structure? **Clustering** groups similar observations: customer segments, document topics, store types, anomalies. It’s exploratory — the value comes from **interpreting** the clusters and acting on them.
`,
    simple: md`
Imagine dumping a bag of mixed sweets on a table and sorting them into piles of similar ones — without anyone telling you the categories. That’s clustering.

**K-means** does it by placing *k* “centre” markers, assigning each sweet to the nearest marker, moving each marker to the middle of its pile, and repeating until nothing changes. Step through it in the demo above.

**Hierarchical clustering** instead starts with every item alone and keeps merging the two closest groups, building a family tree (dendrogram) you can cut at any level.
`,
    technical: md`
### K-means
Objective: minimise **inertia** (within-cluster sum of squares) $\sum_{j=1}^{k}\sum_{x \in C_j}\lVert x - \mu_j\rVert^2$.
1. Initialise $k$ centroids (k-means++ by default spreads them out).
2. **Assign** each point to its nearest centroid.
3. **Update** each centroid to the mean of its points.
4. Repeat until assignments stop changing. Run several initialisations (\`n_init\`) and keep the best.

Properties: fast, scales to large data; assumes roughly spherical, similar-sized clusters; sensitive to scale (standardise!) and outliers; you must choose $k$.

### Choosing k
- **Elbow method:** plot inertia vs $k$; look for the bend where improvement slows.
- **Silhouette score** $s = \frac{b - a}{\max(a, b)} \in [-1, 1]$, where $a$ = mean distance to own cluster, $b$ = mean distance to the nearest other cluster. Higher is better.
- Business usefulness: can each segment be described and acted upon?

### Hierarchical (agglomerative) clustering
Start with $n$ singleton clusters and repeatedly merge the closest pair. **Linkage** defines “closest”: single (nearest points — chains), complete (farthest points), average, **Ward** (smallest increase in variance — similar to k-means). The **dendrogram** shows merges; cutting it at a height gives the clusters. No need to pick $k$ upfront, but $O(n^2)$ memory limits it to thousands of points.

### Others
**DBSCAN** (density-based; finds arbitrary shapes and labels noise), Gaussian mixture models (soft assignments).
`,
    terms: [
      ['Clustering', 'Grouping similar observations without labels.'],
      ['Centroid', 'The mean point of a cluster.'],
      ['Inertia', 'Sum of squared distances of points to their cluster centroid.'],
      ['Elbow method', 'Choosing k where adding clusters stops reducing inertia much.'],
      ['Silhouette score', 'How well each point fits its cluster vs the next nearest one (−1 to 1).'],
      ['Linkage', 'Rule for measuring distance between clusters in hierarchical clustering.'],
      ['Dendrogram', 'Tree diagram of hierarchical merges.'],
    ],
    realWorld: md`
A shopping mall clusters loyalty-card customers by income and spending score and finds five segments: *high-income big spenders*, *high-income savers*, *young enthusiastic spenders*, *budget-conscious* and *average*. Marketing designs different campaigns for each: premium events for big spenders, value bundles for the budget-conscious, and targeted offers to convert high-income savers. You’ll reproduce this with \`data/mall_customers.csv\`.
`,
    steps: [
      'Select features that define “similar” for your business purpose.',
      'Standardise them.',
      'Run k-means for several k; inspect the elbow and silhouette.',
      'Fit the chosen k; profile clusters (mean feature values, sizes).',
      'Name clusters in business language and validate them with stakeholders.',
    ],
    code: [
      {
        title: 'Customer segmentation with k-means',
        code: md`
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

mall = pd.read_csv("data/mall_customers.csv")
X = StandardScaler().fit_transform(mall[["annual_income_k", "spending_score"]])

ks = range(2, 9)
inertia, sil = [], []
for k in ks:
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    inertia.append(km.inertia_)
    sil.append(silhouette_score(X, km.labels_))

fig, ax = plt.subplots(1, 3, figsize=(14, 3.6))
ax[0].plot(list(ks), inertia, marker="o"); ax[0].set_title("Elbow: inertia vs k")
ax[1].plot(list(ks), sil, marker="o", color="#10b981"); ax[1].set_title("Silhouette vs k")

best = KMeans(n_clusters=5, n_init=10, random_state=0).fit(X)
mall["segment"] = best.labels_
ax[2].scatter(mall["annual_income_k"], mall["spending_score"], c=mall["segment"], cmap="tab10", s=15)
ax[2].set_xlabel("Annual income ($k)"); ax[2].set_ylabel("Spending score"); ax[2].set_title("k = 5 segments")
plt.tight_layout(); plt.show()

profile = mall.groupby("segment").agg(customers=("customer_id", "count"), income=("annual_income_k", "mean"),
                                      spending=("spending_score", "mean"), age=("age", "mean")).round(1)
print(profile.sort_values("income"))
`,
        explanation: [
          'Imports: scaler, k-means and the silhouette metric.',
          'Load mall customers and **standardise** the two clustering features so income and score count equally.',
          'Try k from 2 to 8, recording inertia and silhouette for each…',
          '…`n_init=10` runs 10 random starts and keeps the best solution…',
          '…inertia always decreases with k…',
          '…while silhouette peaks at a good k.',
          'Plot the elbow curve and the silhouette curve.',
          'Both point to k = 5 (the elbow bends there and silhouette is highest).',
          'Fit the final model and attach cluster labels to the original data.',
          'Scatter plot coloured by segment: five clear groups.',
          'Profile each segment (size, mean income, spending, age) — the table you would show marketing, ready to be named (e.g. “high income, low spending = savers”).',
        ],
      },
      {
        title: 'Hierarchical clustering and a dendrogram',
        code: md`
import pandas as pd
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import AgglomerativeClustering

mall = pd.read_csv("data/mall_customers.csv").sample(60, random_state=1)
X = StandardScaler().fit_transform(mall[["annual_income_k", "spending_score"]])

Z = linkage(X, method="ward")
plt.figure(figsize=(10, 3.5))
dendrogram(Z, no_labels=True, color_threshold=4)
plt.axhline(4, color="red", linestyle="--")
plt.title("Ward dendrogram (cut at height 4)"); plt.ylabel("merge distance"); plt.show()

labels = fcluster(Z, t=4, criterion="distance")
print("clusters from cutting the dendrogram:", sorted(pd.Series(labels).value_counts().tolist(), reverse=True))
agg = AgglomerativeClustering(n_clusters=5, linkage="ward").fit(X)
print("sklearn agglomerative cluster sizes:", sorted(pd.Series(agg.labels_).value_counts().tolist(), reverse=True))
`,
        explanation: [
          'SciPy provides linkage and dendrogram tools; scikit-learn has AgglomerativeClustering.',
          'Use a sample of 60 customers so the dendrogram stays readable, and standardise.',
          '`linkage(..., "ward")` computes the full merge history using Ward’s criterion.',
          'Draw the dendrogram: each vertical join is a merge; its height is the merge distance.',
          'A red line marks where we “cut” the tree.',
          '`fcluster` converts the cut into flat cluster labels — the number of clusters is the number of branches the line crosses.',
          'The same idea via scikit-learn, asking directly for 5 clusters.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Clustering unscaled features (income in thousands vs scores 1–100).', fix: 'Standardise before distance-based clustering.' },
      { mistake: 'Treating clusters as ground truth.', fix: 'Clusters are a modelling choice; validate stability and usefulness.' },
      { mistake: 'Choosing k by inertia alone (it always decreases).', fix: 'Look for the elbow, use silhouette, and judge interpretability.' },
      { mistake: 'Using k-means for elongated or nested shapes.', fix: 'Try DBSCAN, hierarchical (single linkage) or Gaussian mixtures.' },
    ],
    exercises: [
      {
        id: 'ml6-ex1', title: 'Fit k-means and count members', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
Standardise \`annual_income_k\` and \`spending_score\` from \`data/mall_customers.csv\`, fit \`KMeans(n_clusters=5, n_init=10, random_state=0)\`, and store the sorted list of cluster sizes (largest first) in \`sizes\`.
`,
        starter: md`
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
mall = pd.read_csv("data/mall_customers.csv")
sizes = []
print(sizes)
`,
        solution: md`
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
mall = pd.read_csv("data/mall_customers.csv")
X = StandardScaler().fit_transform(mall[["annual_income_k", "spending_score"]])
km = KMeans(n_clusters=5, n_init=10, random_state=0).fit(X)
sizes = sorted(pd.Series(km.labels_).value_counts().tolist(), reverse=True)
print(sizes)
`,
        tests: md`
_X = StandardScaler().fit_transform(mall[["annual_income_k", "spending_score"]])
_e = sorted(pd.Series(KMeans(n_clusters=5, n_init=10, random_state=0).fit(_X).labels_).value_counts().tolist(), reverse=True)
assert sizes == _e, f"Expected {_e}, got {sizes}"
assert sum(sizes) == len(mall)
`,
        hints: ['Scale with `StandardScaler().fit_transform(...)`.', 'Count labels with `pd.Series(km.labels_).value_counts()`.'],
      },
      {
        id: 'ml6-ex2', title: 'Pick k by silhouette', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`For k in 2–8 on the scaled mall features (\`X\` in the starter), set \`best_k\` to the k with the **highest silhouette score** (use \`KMeans(n_clusters=k, n_init=10, random_state=0)\`).`,
        starter: md`
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
mall = pd.read_csv("data/mall_customers.csv")
X = StandardScaler().fit_transform(mall[["annual_income_k", "spending_score"]])
best_k = 0
`,
        solution: md`
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
mall = pd.read_csv("data/mall_customers.csv")
X = StandardScaler().fit_transform(mall[["annual_income_k", "spending_score"]])
scores = {k: silhouette_score(X, KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)) for k in range(2, 9)}
best_k = max(scores, key=scores.get)
print({k: round(v, 3) for k, v in scores.items()}, best_k)
`,
        tests: md`
_s = {k: silhouette_score(X, KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)) for k in range(2, 9)}
assert best_k == max(_s, key=_s.get), f"Expected {max(_s, key=_s.get)}, got {best_k}"
`,
        hints: ['`fit_predict(X)` returns labels directly.', '`max(scores, key=scores.get)` returns the key with the highest value.'],
      },
      {
        id: 'ml6-ex3', title: 'Inertia and k', type: 'predict', lang: 'python', difficulty: 'beginner',
        prompt: md`What is the inertia of k-means when k equals the number of data points? (a number)`,
        solution: '0', accepted: ['0', 'zero', '0.0'],
        hints: ['Each point is its own centroid.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'In k-means, the update step…', options: ['Assigns points to clusters', 'Moves each centroid to the mean of its assigned points', 'Chooses k', 'Removes outliers'], answer: 1, explanation: 'Assign then update, repeated.' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why does k-means use several initialisations (n_init)?', options: ['To choose k', 'Because results depend on the random start and can get stuck in poor solutions', 'To scale data', 'To compute silhouettes'], answer: 1, explanation: 'Keep the run with the lowest inertia.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A silhouette score near 1 means…', options: ['Points are well matched to their own cluster and far from others', 'Clusters overlap', 'k is too small', 'The data is unscaled'], answer: 0, explanation: 'High silhouette = well-separated clusters.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which linkage behaves most like k-means?', options: ['Single', 'Complete', 'Ward', 'Centroid-free'], answer: 2, explanation: 'Ward minimises within-cluster variance.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Which algorithm can discover arbitrary-shaped clusters and label noise points?', options: ['K-means', 'DBSCAN', 'PCA', 'Linear regression'], answer: 1, explanation: 'Density-based clustering.' },
    ],
    summary: [
      'Clustering finds groups without labels; standardise features first.',
      'K-means alternates assign/update to minimise inertia; choose k by elbow + silhouette + usefulness.',
      'Hierarchical clustering builds a dendrogram; linkage defines cluster distance.',
      'Profile and name clusters so the business can act on them.',
    ],
    resources: [{ label: 'scikit-learn: Clustering', url: 'https://scikit-learn.org/stable/modules/clustering.html' }, ISLP],
  },
  {
    id: 'ml-pca',
    title: 'Dimensionality Reduction & Principal Component Analysis (PCA)',
    minutes: 45,
    difficulty: 'advanced',
    objectives: [
      'Explain why reducing dimensions helps (visualisation, noise, speed, collinearity)',
      'Understand eigenvectors/eigenvalues of the covariance matrix as PCA’s directions and variances',
      'Use explained variance to choose the number of components',
      'Apply PCA in scikit-learn for visualisation and as a preprocessing step',
    ],
    intro: md`
Real datasets often have dozens or thousands of features, many of them correlated. **Principal Component Analysis** finds a small number of new axes that capture most of the information. It lets you plot high-dimensional data in 2-D, remove noise, speed up models and handle multicollinearity.
`,
    simple: md`
Imagine photographing a 3-D object to show it in 2-D. A good photo angle shows the object’s most important shape; a bad angle (from directly above a pencil) shows almost nothing.

PCA automatically finds the **best camera angles** for your data: the first principal component is the direction in which the data is most spread out, the second is the next most spread-out direction at a right angle to the first, and so on. Keeping just the first few components keeps most of the “shape” with far fewer numbers.
`,
    technical: md`
### Eigenvectors and eigenvalues (the math you need)
For a square matrix $A$, an **eigenvector** $\mathbf{v}$ is a direction that $A$ only stretches (doesn’t rotate): $A\mathbf{v} = \lambda\mathbf{v}$; the scalar $\lambda$ is its **eigenvalue** (the stretch factor).

### PCA
1. **Standardise** the features (PCA is scale-sensitive).
2. Compute the covariance matrix $\Sigma = \frac{1}{n-1}X_c^\top X_c$ (with centred data $X_c$).
3. Its eigenvectors are the **principal components** (orthogonal directions); eigenvalues are the **variance** along each.
4. Sort by eigenvalue; project the data onto the top $k$ components: $Z = X_c W_k$.

(In practice, libraries use the SVD $X_c = U S V^\top$, whose right singular vectors are the same components.)

### Choosing the number of components
**Explained variance ratio** $\lambda_j / \sum \lambda$. Keep enough components for e.g. 90–95% cumulative variance, or look for an elbow in the scree plot. \`PCA(n_components=0.95)\` chooses automatically.

### Interpreting
\`components_\` (loadings) show how each original feature contributes to each component. Components are combinations of features, so they can be harder to interpret than original columns.

### Uses and cautions
- Visualising clusters/classes in 2-D; compression; denoising; decorrelating features before regression.
- Fit PCA on the **training** data only (inside a pipeline).
- PCA is linear and unsupervised: it maximises variance, not predictive power. Non-linear alternatives for visualisation: t-SNE, UMAP.
`,
    terms: [
      ['Dimensionality reduction', 'Representing data with fewer features while keeping most information.'],
      ['Eigenvector', 'A direction a matrix only scales: Av = λv.'],
      ['Eigenvalue', 'The scale factor λ for an eigenvector; in PCA, the variance along a component.'],
      ['Principal component', 'An orthogonal direction of maximum remaining variance.'],
      ['Explained variance ratio', 'Share of total variance captured by a component.'],
      ['Loadings', 'Weights of the original features in each component.'],
      ['Scree plot', 'Plot of explained variance per component.'],
    ],
    realWorld: md`
A breast-cancer screening dataset has 30 measurements per cell sample (radius, texture, smoothness…), many highly correlated. PCA shows the first two components already explain ~63% of the variance and separate malignant from benign samples visibly in a 2-D plot — useful for explaining the data to clinicians — and ~10 components keep 95% of the information for faster modelling.
`,
    steps: [
      'Standardise features.',
      'Fit PCA on training data; inspect explained variance and the cumulative curve.',
      'Choose k for the goal (2–3 for visualisation, ~90–95% variance for modelling).',
      'Transform data and visualise/model.',
      'Examine loadings to interpret the leading components.',
    ],
    code: [
      {
        title: 'Eigenvectors of a covariance matrix = PCA directions',
        code: md`
import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)
x = rng.normal(0, 3, 500)
y = 0.8 * x + rng.normal(0, 1, 500)
X = np.column_stack([x, y])
Xc = X - X.mean(axis=0)

cov = np.cov(Xc, rowvar=False)
eigvals, eigvecs = np.linalg.eigh(cov)
order = eigvals.argsort()[::-1]
eigvals, eigvecs = eigvals[order], eigvecs[:, order]
print("eigenvalues (variances):", eigvals.round(2))
print("first eigenvector:", eigvecs[:, 0].round(3))
v = eigvecs[:, 0]
print("check A v = λ v:", np.allclose(cov @ v, eigvals[0] * v))

pca = PCA().fit(X)
print("sklearn components:\n", pca.components_.round(3))
print("explained variance ratio:", pca.explained_variance_ratio_.round(3))
`,
        explanation: [
          'NumPy and scikit-learn’s PCA.',
          'Simulate two strongly correlated features (y ≈ 0.8x + noise): the data forms a tilted ellipse.',
          'Stack into a 500 × 2 matrix and centre it (subtract the means).',
          'Covariance matrix (2 × 2).',
          '`np.linalg.eigh` computes eigenvalues/eigenvectors of a symmetric matrix.',
          'Sort from largest to smallest eigenvalue.',
          'The first eigenvalue is much larger: most variance lies along one direction.',
          'The first eigenvector points along the ellipse’s long axis.',
          'Verify the defining property $\\Sigma v = \\lambda v$.',
          'scikit-learn’s PCA finds the same directions (possibly with flipped signs, which is equivalent)…',
          '…and reports the explained variance ratios (~95% in the first component).',
        ],
      },
      {
        title: 'PCA on 30 features: explained variance and a 2-D view',
        code: md`
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

data = load_breast_cancer()
Xs = StandardScaler().fit_transform(data.data)
pca = PCA().fit(Xs)
cum = np.cumsum(pca.explained_variance_ratio_)
print("variance explained by PC1, PC2:", pca.explained_variance_ratio_[:2].round(3))
print("components needed for 95%:", int(np.argmax(cum >= 0.95)) + 1, "of", Xs.shape[1])

Z = PCA(n_components=2).fit_transform(Xs)
fig, ax = plt.subplots(1, 2, figsize=(11, 3.8))
ax[0].plot(range(1, 31), cum, marker="o", markersize=3); ax[0].axhline(0.95, color="red", linestyle="--")
ax[0].set_title("Cumulative explained variance"); ax[0].set_xlabel("number of components")
for label, color in [(0, "#dc2626"), (1, "#2563eb")]:
    ax[1].scatter(Z[data.target == label, 0], Z[data.target == label, 1], s=8, alpha=0.6, c=color, label=data.target_names[label])
ax[1].set_xlabel("PC1"); ax[1].set_ylabel("PC2"); ax[1].legend(); ax[1].set_title("30 features shown in 2-D")
plt.tight_layout(); plt.show()

top = np.argsort(np.abs(pca.components_[0]))[::-1][:5]
print("features with largest PC1 loadings:", [data.feature_names[i] for i in top])
`,
        explanation: [
          'Load 569 samples × 30 features (built into scikit-learn).',
          'Standardise — essential because features have very different units.',
          'Fit PCA with all components and compute the cumulative explained variance.',
          'PC1 and PC2 together explain about 63% of the variance.',
          'About 10 components (out of 30) are enough for 95%.',
          'Project onto 2 components for plotting.',
          'Left: the cumulative curve with the 95% line.',
          'Right: samples in the PC1–PC2 plane coloured by diagnosis — the two classes separate visibly even though PCA never saw the labels.',
          'Loadings: the features weighing most on PC1 are size-related measurements (radius, perimeter, area…), so PC1 is roughly “tumour size”.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Running PCA on unscaled data (large-unit features dominate).', fix: 'Standardise first.' },
      { mistake: 'Fitting PCA on the full dataset before splitting.', fix: 'Fit inside a pipeline on training data only.' },
      { mistake: 'Assuming the top components are the most predictive.', fix: 'PCA maximises variance, not relevance to the target.' },
    ],
    exercises: [
      {
        id: 'ml7-ex1', title: 'Components for 90%', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`Standardise the wine dataset (\`load_wine\`) and set \`n90\` to the smallest number of principal components whose cumulative explained variance is **at least 0.90**.`,
        starter: md`
import numpy as np
from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
X, y = load_wine(return_X_y=True)
n90 = 0
`,
        solution: md`
import numpy as np
from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
X, y = load_wine(return_X_y=True)
cum = np.cumsum(PCA().fit(StandardScaler().fit_transform(X)).explained_variance_ratio_)
n90 = int(np.argmax(cum >= 0.90)) + 1
print(cum.round(3), n90)
`,
        tests: md`
_c = np.cumsum(PCA().fit(StandardScaler().fit_transform(X)).explained_variance_ratio_)
assert n90 == int(np.argmax(_c >= 0.90)) + 1, f"Expected {int(np.argmax(_c >= 0.90)) + 1}, got {n90}"
`,
        hints: ['`np.cumsum(pca.explained_variance_ratio_)`', '`np.argmax(cum >= 0.90) + 1` (argmax finds the first True).'],
      },
      {
        id: 'ml7-ex2', title: 'Verify an eigenvector', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`For \`A = np.array([[2, 1], [1, 2]])\`, use \`np.linalg.eigh\` and store the **largest** eigenvalue in \`lam\` and its eigenvector in \`v\`.`,
        starter: md`
import numpy as np
A = np.array([[2.0, 1.0], [1.0, 2.0]])
lam = 0
v = None
`,
        solution: md`
import numpy as np
A = np.array([[2.0, 1.0], [1.0, 2.0]])
vals, vecs = np.linalg.eigh(A)
i = np.argmax(vals)
lam = vals[i]
v = vecs[:, i]
print(lam, v)
`,
        tests: md`
assert abs(lam - 3) < 1e-9, f"The largest eigenvalue of [[2,1],[1,2]] is 3, got {lam}"
assert v is not None and np.allclose(A @ v, lam * v), "v must satisfy A v = lam v"
`,
        hints: ['`eigh` returns eigenvalues in ascending order; eigenvectors are the columns.'],
      },
      {
        id: 'ml7-ex3', title: 'Why scale before PCA?', type: 'predict', lang: 'python', difficulty: 'beginner',
        prompt: md`Without scaling, a feature measured in dollars (values ~50,000) and one measured in years (~40) go into PCA. Which feature will dominate the first component? (dollars / years)`,
        solution: 'dollars', accepted: ['dollars', 'dollar', 'income', 'the dollar feature'],
        hints: ['PCA maximises variance, and variance depends on units.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'The first principal component is the direction of…', options: ['Smallest variance', 'Largest variance', 'The target variable', 'The first feature'], answer: 1, explanation: 'Maximum variance.' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'In PCA, eigenvalues of the covariance matrix represent…', options: ['Feature means', 'Variance along each component', 'Cluster counts', 'Class probabilities'], answer: 1, explanation: 'Larger eigenvalue = more variance.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Principal components are…', options: ['Correlated with each other', 'Orthogonal (uncorrelated)', 'Always the original features', 'Labels'], answer: 1, explanation: 'Eigenvectors of a symmetric matrix are orthogonal.' },
      { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'PCA is a supervised method. True or false?', options: ['True', 'False — it ignores labels'], answer: 1, explanation: 'It uses only X.' },
      { id: 'q5', kind: 'text', difficulty: 'intermediate', prompt: 'If A v = 4 v, what is the eigenvalue?', accepted: ['4'], explanation: 'λ = 4.' },
    ],
    summary: [
      'Eigenvectors are stretch-only directions; eigenvalues are stretch factors.',
      'PCA = eigenvectors of the covariance matrix of standardised data, sorted by variance.',
      'Choose components by cumulative explained variance (or 2–3 for plots).',
      'Fit in pipelines; PCA is unsupervised and linear.',
    ],
    resources: [{ label: 'scikit-learn: PCA', url: 'https://scikit-learn.org/stable/modules/decomposition.html#pca' }, { label: '3Blue1Brown — Eigenvectors and eigenvalues', url: 'https://www.3blue1brown.com/lessons/eigenvalues' }],
  },
  {
    id: 'ml-evaluation',
    title: 'Model Evaluation: Confusion Matrix, Precision, Recall, F1, MAE & MSE',
    minutes: 50,
    difficulty: 'intermediate',
    widgets: ['confusion-matrix'],
    objectives: [
      'Build and read a confusion matrix',
      'Compute and choose between accuracy, precision, recall, F1 and ROC-AUC',
      'Evaluate regression models with MAE, MSE, RMSE and R²',
      'Match metrics to business costs and class imbalance',
    ],
    intro: md`
“How good is the model?” depends entirely on **what mistakes cost**. Missing a cancer diagnosis is far worse than a false alarm; flagging a loyal customer as fraud annoys them. Choosing the right metric is as important as choosing the model.
`,
    simple: md`
For a yes/no prediction there are four outcomes:
- **True positive:** said yes, was yes (caught the fraud).
- **False positive:** said yes, was no (false alarm).
- **False negative:** said no, was yes (missed fraud).
- **True negative:** said no, was no.

**Precision** = of everything we flagged, how much was right? **Recall** = of all the real cases, how many did we catch? Move the threshold in the demo to see the trade-off: catch more fraud and you raise more false alarms.

For number predictions, measure how far off we are on average: **MAE** (average error) and **RMSE** (punishes big errors more).
`,
    technical: md`
### Confusion matrix (binary)
| | Predicted + | Predicted − |
|---|---|---|
| **Actual +** | TP | FN |
| **Actual −** | FP | TN |

### Classification metrics
- **Accuracy** $= \frac{TP + TN}{\text{all}}$ — misleading with imbalanced classes.
- **Precision** $= \frac{TP}{TP + FP}$ — “when we say yes, how often are we right?” (cost of false alarms).
- **Recall / sensitivity / TPR** $= \frac{TP}{TP + FN}$ — “how many positives do we catch?” (cost of misses).
- **Specificity** $= \frac{TN}{TN + FP}$.
- **F1** $= 2\cdot\frac{P\cdot R}{P + R}$ — harmonic mean, balances P and R.
- **ROC curve** plots TPR vs FPR over all thresholds; **AUC** = probability that a random positive gets a higher score than a random negative (0.5 = random, 1 = perfect). **Precision-recall curves** are more informative when positives are rare.
- Multi-class: per-class metrics with macro/weighted averages (\`classification_report\`).

### Regression metrics
- $\text{MAE} = \frac{1}{n}\sum|y - \hat{y}|$ — interpretable in units, robust to outliers.
- $\text{MSE} = \frac{1}{n}\sum(y - \hat{y})^2$; $\text{RMSE} = \sqrt{\text{MSE}}$ — penalise large errors.
- $R^2 = 1 - \frac{\sum(y-\hat{y})^2}{\sum(y - \bar{y})^2}$.
- MAPE (percentage error) — undefined near zero targets.

### Choosing metrics
Translate errors into costs: e.g. a missed churner costs \$600 of lost revenue, a retention offer costs \$60 → favour recall, then choose the threshold that minimises expected cost. Always report the baseline and the metric on held-out data.
`,
    terms: [
      ['Confusion matrix', 'Table of TP, FP, FN, TN counts.'],
      ['Precision', 'TP / (TP + FP): correctness of positive predictions.'],
      ['Recall', 'TP / (TP + FN): share of actual positives found.'],
      ['F1-score', 'Harmonic mean of precision and recall.'],
      ['ROC-AUC', 'Area under the ROC curve; threshold-independent ranking quality.'],
      ['MAE', 'Mean absolute error.'],
      ['MSE / RMSE', 'Mean squared error and its square root.'],
      ['Class imbalance', 'When one class is much rarer than another.'],
    ],
    realWorld: md`
A fraud team at a payments company reports **recall at 1% false-positive rate**: of transactions flagged, how much fraud is caught while bothering only 1 in 100 legitimate customers. Their old model had 99.6% accuracy — exactly the share of legitimate transactions — meaning it caught almost nothing. Switching to precision/recall-based evaluation exposed the problem immediately.
`,
    steps: [
      'Write down what a false positive and a false negative cost.',
      'Compute the confusion matrix on held-out data.',
      'Report precision, recall, F1 (and ROC-AUC/PR-AUC) — plus the baseline.',
      'Choose a threshold that optimises the business metric (e.g. expected cost).',
      'For regression, report MAE and RMSE in real units, plus R².',
    ],
    code: [
      {
        title: 'Classification metrics, thresholds and expected cost',
        code: md`
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score, precision_score, recall_score

df = pd.read_csv("data/churn.csv")
X = pd.get_dummies(df.drop(columns=["customer_id", "churn"]), drop_first=True, dtype=int)
y = (df["churn"] == "Yes").astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_tr, y_tr)
proba = model.predict_proba(X_te)[:, 1]

pred = (proba >= 0.5).astype(int)
print(confusion_matrix(y_te, pred))
print(classification_report(y_te, pred, target_names=["stay", "churn"], digits=3))
print("ROC-AUC:", round(roc_auc_score(y_te, proba), 3))

COST_MISS, COST_OFFER = 600, 60
rows = []
for t in np.arange(0.1, 0.91, 0.1):
    p = (proba >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_te, p).ravel()
    cost = fn * COST_MISS + (tp + fp) * COST_OFFER
    rows.append((round(t, 1), precision_score(y_te, p, zero_division=0), recall_score(y_te, p), cost))
table = pd.DataFrame(rows, columns=["threshold", "precision", "recall", "expected_cost"]).round(3)
print(table)
print("best threshold by cost:", table.loc[table["expected_cost"].idxmin(), "threshold"])
`,
        explanation: [
          'Imports: model pieces plus confusion matrix, report and metric functions.',
          'Prepare churn features (one-hot), target and a stratified 70/30 split.',
          'Fit a scaled logistic regression and get churn probabilities for the test set.',
          'Default threshold 0.5 → class predictions.',
          '`confusion_matrix` rows = actual (stay, churn), columns = predicted.',
          '`classification_report` prints precision, recall and F1 per class plus averages.',
          'ROC-AUC uses probabilities, independent of the threshold.',
          'Business costs: a missed churner loses \$600; every retention offer costs \$60.',
          'For thresholds 0.1 … 0.9…',
          '…make predictions and unpack the confusion matrix (`ravel()` order: tn, fp, fn, tp)…',
          '…expected cost = misses × 600 + offers sent × 60…',
          '…and record precision, recall and cost.',
          'The table shows the precision/recall trade-off; a **lower** threshold than 0.5 minimises cost here because misses are expensive.',
        ],
      },
      {
        title: 'Regression metrics in real units',
        code: md`
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

houses = pd.read_csv("data/houses.csv")
X = pd.get_dummies(houses.drop(columns=["house_id", "price"]), dtype=int)
y = houses["price"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)

models = {"baseline": DummyRegressor(), "linear": LinearRegression(),
          "forest": RandomForestRegressor(n_estimators=200, random_state=0, n_jobs=1)}
for name, m in models.items():
    p = m.fit(X_tr, y_tr).predict(X_te)
    mae, mse = mean_absolute_error(y_te, p), mean_squared_error(y_te, p)
    print(f"{name:8s} MAE=\${mae:9,.0f}  RMSE=\${np.sqrt(mse):9,.0f}  R²={r2_score(y_te, p):6.3f}")
`,
        explanation: [
          'Regression metrics from sklearn.metrics.',
          'House features and prices, 75/25 split.',
          'Three models: mean baseline, linear regression and a random forest.',
          'For each: fit on train, predict on test…',
          '…compute MAE and MSE…',
          '…and print MAE and RMSE in dollars plus R². RMSE ≥ MAE always; a big gap means some large errors. The baseline’s R² is about 0 by construction.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Reporting accuracy on imbalanced data.', fix: 'Report precision, recall, F1 and PR/ROC-AUC with a baseline.' },
      { mistake: 'Confusing precision and recall.', fix: 'Precision: “of predicted positives”; recall: “of actual positives”.' },
      { mistake: 'Computing ROC-AUC from hard 0/1 predictions.', fix: 'Pass probabilities/scores.' },
      { mistake: 'Reporting MSE in squared dollars to stakeholders.', fix: 'Use MAE or RMSE in original units.' },
    ],
    exercises: [
      {
        id: 'ml8-ex1', title: 'Metrics from counts', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write \`metrics(tp, fp, fn, tn)\` returning a dict with keys \`accuracy\`, \`precision\`, \`recall\`, \`f1\`.`,
        starter: md`
def metrics(tp, fp, fn, tn):
    return {}

print(metrics(40, 10, 20, 130))
`,
        solution: md`
def metrics(tp, fp, fn, tn):
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    return {
        "accuracy": (tp + tn) / (tp + fp + fn + tn),
        "precision": precision,
        "recall": recall,
        "f1": 2 * precision * recall / (precision + recall),
    }

print(metrics(40, 10, 20, 130))
`,
        tests: md`
m = metrics(40, 10, 20, 130)
assert abs(m["accuracy"] - 0.85) < 1e-9 and abs(m["precision"] - 0.8) < 1e-9
assert abs(m["recall"] - 40 / 60) < 1e-9 and abs(m["f1"] - 2 * 0.8 * (2 / 3) / (0.8 + 2 / 3)) < 1e-9
`,
        hints: ['precision = tp / (tp + fp); recall = tp / (tp + fn).', 'f1 = 2PR / (P + R).'],
      },
      {
        id: 'ml8-ex2', title: 'Confusion matrix on real predictions', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
Using \`y_te\` and \`pred\` from the starter, compute the confusion matrix with \`confusion_matrix\` and unpack it into \`tn, fp, fn, tp\`. Then set \`recall\` = tp / (tp + fn).
`,
        starter: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import confusion_matrix
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = (df["churn"] == "Yes").astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
pred = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_tr, y_tr).predict(X_te)
tn = fp = fn = tp = 0
recall = 0
`,
        solution: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import confusion_matrix
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = (df["churn"] == "Yes").astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
pred = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_tr, y_tr).predict(X_te)
tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()
recall = tp / (tp + fn)
print(tn, fp, fn, tp, round(recall, 3))
`,
        tests: md`
from sklearn.metrics import recall_score
_c = confusion_matrix(y_te, pred).ravel()
assert (tn, fp, fn, tp) == tuple(_c), f"Expected (tn, fp, fn, tp) = {tuple(_c)}"
assert abs(recall - recall_score(y_te, pred)) < 1e-9
`,
        hints: ['`confusion_matrix(y_te, pred).ravel()` returns tn, fp, fn, tp in that order.'],
      },
      {
        id: 'ml8-ex3', title: 'RMSE by hand', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write \`rmse(y, y_hat)\` returning the root mean squared error of two NumPy arrays.`,
        starter: md`
import numpy as np

def rmse(y, y_hat):
    return 0

print(rmse(np.array([3, 5, 7]), np.array([2, 5, 10])))
`,
        solution: md`
import numpy as np

def rmse(y, y_hat):
    return float(np.sqrt(np.mean((np.asarray(y) - np.asarray(y_hat)) ** 2)))

print(rmse(np.array([3, 5, 7]), np.array([2, 5, 10])))
`,
        tests: md`
assert abs(rmse(np.array([3, 5, 7]), np.array([2, 5, 10])) - np.sqrt(10 / 3)) < 1e-9
assert rmse(np.array([1.0, 2.0]), np.array([1.0, 2.0])) == 0
`,
        hints: ['Square the errors, take the mean, then the square root.'],
      },
      {
        id: 'ml8-ex4', title: 'Which metric?', type: 'predict', lang: 'python', difficulty: 'intermediate',
        prompt: md`For a cancer-screening test where missing a cancer is far worse than a false alarm, which metric should you prioritise: precision or recall?`,
        solution: 'recall', accepted: ['recall', 'sensitivity'],
        hints: ['Which metric counts missed positives (false negatives)?'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A false negative is…', options: ['Predicted positive, actually negative', 'Predicted negative, actually positive', 'Correct negative', 'Correct positive'], answer: 1, explanation: 'A missed positive case.' },
      { id: 'q2', kind: 'text', difficulty: 'intermediate', prompt: 'TP = 30, FP = 10. What is precision? (decimal)', accepted: ['0.75', '.75', '75%'], explanation: '30 / 40.' },
      { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'TP = 30, FN = 20. What is recall? (decimal)', accepted: ['0.6', '.6', '60%'], explanation: '30 / 50.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which regression metric penalises large errors most?', options: ['MAE', 'RMSE', 'Median absolute error', 'Accuracy'], answer: 1, explanation: 'Squaring amplifies large errors.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'ROC-AUC = 0.5 means the model…', options: ['Is perfect', 'Ranks no better than random', 'Has 50% accuracy', 'Is overfitting'], answer: 1, explanation: 'Random scores give AUC 0.5.' },
      { id: 'q6', kind: 'mcq', difficulty: 'advanced', prompt: 'Positives are 1% of data. Which curve is more informative?', options: ['ROC curve', 'Precision-recall curve', 'Learning curve', 'Elbow curve'], answer: 1, explanation: 'PR curves focus on the rare positive class.' },
    ],
    summary: [
      'Confusion matrix: TP, FP, FN, TN.',
      'Precision vs recall trade-off controlled by the threshold; F1 balances them; ROC/PR-AUC summarise ranking.',
      'Regression: MAE, RMSE (in units), R².',
      'Choose metrics and thresholds from business costs; compare with baselines.',
    ],
    resources: [{ label: 'scikit-learn: Model evaluation', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' }, ISLP],
  },
  {
    id: 'ml-validation-tuning',
    title: 'Cross-Validation, Overfitting/Underfitting & Hyperparameter Tuning',
    minutes: 50,
    difficulty: 'advanced',
    widgets: ['overfitting'],
    objectives: [
      'Diagnose underfitting and overfitting with the bias–variance trade-off',
      'Use k-fold and stratified cross-validation for reliable estimates',
      'Tune hyperparameters with GridSearchCV / RandomizedSearchCV inside pipelines',
      'Keep a clean train / validation / test protocol and avoid leakage',
    ],
    intro: md`
A model that scores 99% on its training data might be useless on new data. This lesson gives you the tools professionals use to estimate real-world performance honestly and to tune models without fooling yourself — the difference between a portfolio project that impresses and one that doesn’t survive questions.
`,
    simple: md`
- **Underfitting** = studying too little: you fail both practice tests and the real exam (model too simple).
- **Overfitting** = memorising the practice answers: perfect on practice, poor on the real exam (model too complex).

**Cross-validation** is like taking five different practice exams and averaging your score, instead of trusting one lucky test.

**Hyperparameters** are the settings you choose before training (tree depth, k in k-NN). **Tuning** tries many settings and picks the one with the best cross-validated score. Try the polynomial-degree slider above to watch both failure modes.
`,
    technical: md`
### Bias–variance trade-off
Expected test error ≈ **bias²** (error from wrong assumptions; underfitting) + **variance** (sensitivity to the training sample; overfitting) + irreducible noise. Complexity reduces bias but increases variance.

| Symptom | Diagnosis | Remedies |
|---|---|---|
| High train error, high test error | underfitting | more features, more complex model, less regularisation |
| Low train error, much higher test error | overfitting | more data, simpler model, regularisation, fewer features, early stopping |

**Learning curves** (score vs training-set size) and **validation curves** (score vs a hyperparameter) visualise this.

### Cross-validation
- **k-fold:** split training data into k folds; train on k−1, validate on the remaining one; repeat k times; average. Typical k = 5 or 10.
- **Stratified k-fold** for classification (default in sklearn for classifiers).
- **TimeSeriesSplit** for time-ordered data (never train on the future).
- \`cross_val_score(model, X, y, cv=5, scoring="roc_auc")\` or \`cross_validate\` for several metrics.

### Protocol
1. Hold out a **test set** first and don’t touch it.
2. Use cross-validation on the training set to choose models/hyperparameters.
3. Refit the best model on all training data; evaluate **once** on the test set.

### Tuning
- \`GridSearchCV(pipeline, param_grid, cv=5, scoring=...)\` tries every combination; \`RandomizedSearchCV\` samples combinations — better for large spaces.
- Parameter names inside pipelines use \`step__param\` (e.g. \`"clf__max_depth"\`).
- \`best_params_\`, \`best_score_\` (CV score), \`best_estimator_\` (refit on all training data).

### Leakage traps
Scaling, imputation, feature selection or oversampling done on the **full** dataset before CV leaks information. Put every learned preprocessing step **inside the pipeline** so it is re-fit within each fold.
`,
    terms: [
      ['Overfitting', 'Learning noise in the training data; poor generalisation.'],
      ['Underfitting', 'Model too simple to capture the pattern.'],
      ['Bias–variance trade-off', 'Balance between error from simplifying assumptions and from sensitivity to data.'],
      ['Cross-validation', 'Repeated train/validate splits to estimate performance.'],
      ['Hyperparameter', 'A setting chosen before training (e.g. max_depth, C, k).'],
      ['GridSearchCV', 'Exhaustive search over hyperparameter combinations with CV.'],
      ['Validation curve', 'Score vs a hyperparameter value for train and validation sets.'],
      ['Pipeline', 'Chained preprocessing + model fitted together to avoid leakage.'],
    ],
    realWorld: md`
In Kaggle competitions, participants who tune on the public leaderboard often drop hundreds of places when the private test set is revealed — they overfit to the public split. Winners rely on solid local cross-validation. Companies follow the same discipline: a model is approved only after CV-based selection and a final, single evaluation on a held-out period.
`,
    steps: [
      'Split off a test set and set it aside.',
      'Build a pipeline containing all preprocessing and the model.',
      'Estimate baseline performance with cross_val_score.',
      'Plot a validation curve or run GridSearchCV/RandomizedSearchCV over key hyperparameters.',
      'Refit the best pipeline and evaluate once on the test set; report CV mean ± std and test score.',
    ],
    code: [
      {
        title: 'Validation curve: diagnosing under- and overfitting',
        code: md`
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import validation_curve
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
depths = np.arange(1, 13)
train_sc, val_sc = validation_curve(DecisionTreeClassifier(random_state=0), X, y,
                                    param_name="max_depth", param_range=depths, cv=5)
plt.plot(depths, train_sc.mean(axis=1), marker="o", label="training score")
plt.plot(depths, val_sc.mean(axis=1), marker="o", label="cross-validation score")
plt.fill_between(depths, val_sc.mean(axis=1) - val_sc.std(axis=1), val_sc.mean(axis=1) + val_sc.std(axis=1), alpha=0.2)
plt.xlabel("max_depth"); plt.ylabel("accuracy"); plt.title("Validation curve"); plt.legend(); plt.show()
best = depths[val_sc.mean(axis=1).argmax()]
print("best depth by CV:", best, " CV accuracy:", round(val_sc.mean(axis=1).max(), 3))
`,
        explanation: [
          'Imports: dataset, `validation_curve` and a tree.',
          'Load 569 samples.',
          'Depths to evaluate.',
          '`validation_curve` runs 5-fold CV for every depth, returning training and validation scores per fold.',
          'Plot mean training score — it climbs toward 1.0 as depth grows…',
          '…and mean CV score, which rises then falls: left side = underfitting, right side = overfitting.',
          'A shaded band shows ±1 standard deviation across folds (uncertainty).',
          'Labels and display.',
          'Pick the depth with the highest mean CV score.',
        ],
      },
      {
        title: 'Grid search inside a pipeline, then a single test evaluation',
        code: md`
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("data/churn.csv")
y = (df["churn"] == "Yes").astype(int)
num = ["tenure_months", "monthly_charges", "total_charges", "support_calls"]
cat = ["contract", "internet_service", "tech_support", "paperless_billing"]
X_tr, X_te, y_tr, y_te = train_test_split(df[num + cat], y, test_size=0.2, stratify=y, random_state=0)

prep = ColumnTransformer([("num", StandardScaler(), num), ("cat", OneHotEncoder(handle_unknown="ignore"), cat)])
logit = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])
cv = cross_val_score(logit, X_tr, y_tr, cv=5, scoring="roc_auc")
print(f"logistic regression CV ROC-AUC: {cv.mean():.3f} ± {cv.std():.3f}")

forest = Pipeline([("prep", prep), ("clf", RandomForestClassifier(random_state=0, n_jobs=1))])
grid = GridSearchCV(forest, {"clf__n_estimators": [100, 200], "clf__max_depth": [4, 8, None],
                             "clf__min_samples_leaf": [1, 5]}, cv=5, scoring="roc_auc")
grid.fit(X_tr, y_tr)
print("best params:", grid.best_params_, " best CV ROC-AUC:", round(grid.best_score_, 3))

from sklearn.metrics import roc_auc_score
best = grid.best_estimator_ if grid.best_score_ > cv.mean() else logit.fit(X_tr, y_tr)
print("chosen model:", type(best.named_steps["clf"]).__name__,
      " TEST ROC-AUC:", round(roc_auc_score(y_te, best.predict_proba(X_te)[:, 1]), 3))
`,
        explanation: [
          'Imports for splitting, CV, grid search, preprocessing, pipelines and two candidate models.',
          'Target and feature lists.',
          'Hold out 20% as the **test set** — not touched until the very end.',
          'Preprocessing in a ColumnTransformer (scaling + one-hot); `handle_unknown="ignore"` tolerates unseen categories.',
          'Candidate 1: logistic regression pipeline.',
          '5-fold CV ROC-AUC on the **training** set only; preprocessing is re-fitted inside each fold (no leakage).',
          'Report mean ± std across folds.',
          'Candidate 2: random forest pipeline.',
          '`GridSearchCV` tries all 2 × 3 × 2 = 12 combinations with 5-fold CV each (60 fits). Pipeline parameter names use `clf__param`.',
          'Fit the search; it refits the best combination on all training data.',
          'Best hyperparameters and their CV score.',
          'Choose the model with the better **CV** score (never by test score)…',
          '…and evaluate it **once** on the held-out test set — the number you would report.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Tuning hyperparameters on the test set.', fix: 'Tune with CV on the training data; use the test set once at the end.' },
      { mistake: 'Scaling/imputing before splitting or outside the pipeline.', fix: 'Put preprocessing inside the Pipeline.' },
      { mistake: 'Random K-fold on time series.', fix: 'Use TimeSeriesSplit or a time-based holdout.' },
      { mistake: 'Reporting only the best CV mean.', fix: 'Report mean ± std across folds and the final test score.' },
    ],
    exercises: [
      {
        id: 'ml9-ex1', title: 'Cross-validated accuracy', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`Compute 5-fold cross-validated accuracy of \`make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))\` on the breast-cancer data (\`X, y\` in the starter). Store the **mean** in \`cv_mean\`.`,
        starter: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
X, y = load_breast_cancer(return_X_y=True)
cv_mean = 0
`,
        solution: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
X, y = load_breast_cancer(return_X_y=True)
scores = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5)
cv_mean = scores.mean()
print(scores.round(3), round(cv_mean, 3))
`,
        tests: md`
_s = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), X, y, cv=5).mean()
assert abs(cv_mean - _s) < 1e-9 and cv_mean > 0.95, f"Expected {_s:.4f}, got {cv_mean}"
`,
        hints: ['`cross_val_score(pipeline, X, y, cv=5)` returns 5 scores.', 'Take `.mean()`.'],
      },
      {
        id: 'ml9-ex2', title: 'Grid search k for k-NN', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
Tune \`n_neighbors\` ∈ {1, 3, 5, 7, 9, 11, 15} for \`Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])\` on the wine **training** split with \`GridSearchCV(cv=5)\`. Store the fitted search in \`grid\` and the test accuracy of the best model in \`test_acc\`.
`,
        starter: md`
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=1)
grid = None
test_acc = 0
`,
        solution: md`
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=1)
pipe = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])
grid = GridSearchCV(pipe, {"knn__n_neighbors": [1, 3, 5, 7, 9, 11, 15]}, cv=5).fit(X_tr, y_tr)
test_acc = grid.score(X_te, y_te)
print(grid.best_params_, round(grid.best_score_, 3), round(test_acc, 3))
`,
        tests: md`
assert grid is not None and hasattr(grid, "best_params_"), "grid should be a fitted GridSearchCV"
assert grid.param_grid == {"knn__n_neighbors": [1, 3, 5, 7, 9, 11, 15]}, "Use the parameter name knn__n_neighbors with the given values"
assert abs(test_acc - grid.best_estimator_.score(X_te, y_te)) < 1e-9 and test_acc > 0.9
`,
        hints: ['Parameter names in a pipeline: `"knn__n_neighbors"`.', 'Fit on X_tr/y_tr; `grid.score(X_te, y_te)` uses the best refitted model.'],
      },
      {
        id: 'ml9-ex3', title: 'Diagnose the model', type: 'predict', lang: 'python', difficulty: 'intermediate',
        prompt: md`A model has training accuracy 0.62 and test accuracy 0.60 on a task where good models reach 0.90. Is it underfitting or overfitting?`,
        solution: 'underfitting', accepted: ['underfitting', 'underfit', 'under'],
        hints: ['Both scores are low and close together.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Train accuracy 0.99, test accuracy 0.70 suggests…', options: ['Underfitting', 'Overfitting', 'Perfect model', 'Leakage only'], answer: 1, explanation: 'A large train–test gap = high variance.' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why use cross-validation instead of a single validation split?', options: ['It is faster', 'It gives a more reliable estimate by averaging over several splits', 'It replaces the test set entirely', 'It removes overfitting'], answer: 1, explanation: 'Less dependent on one lucky/unlucky split.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which is a hyperparameter?', options: ['Logistic regression coefficients', 'max_depth of a tree', 'Predicted probabilities', 'Residuals'], answer: 1, explanation: 'Set before training, not learned.' },
      { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Why put StandardScaler inside the pipeline during GridSearchCV?', options: ['Style only', 'So scaling is fitted only on each fold’s training part, preventing leakage', 'Because GridSearchCV can’t scale', 'To reduce memory'], answer: 1, explanation: 'Each fold must mimic unseen data.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'For forecasting next month’s sales, which CV scheme is appropriate?', options: ['Random K-fold', 'TimeSeriesSplit (train on past, validate on future)', 'Leave-one-out on shuffled data', 'No validation'], answer: 1, explanation: 'Respect time order.' },
    ],
    summary: [
      'Underfitting = high bias; overfitting = high variance; diagnose with train vs validation scores.',
      'k-fold / stratified / time-series CV for reliable estimates.',
      'Tune with GridSearchCV/RandomizedSearchCV using pipelines (step__param).',
      'Protocol: hold out test → tune with CV → evaluate once on test.',
    ],
    resources: [{ label: 'scikit-learn: Cross-validation', url: 'https://scikit-learn.org/stable/modules/cross_validation.html' }, { label: 'scikit-learn: Tuning hyperparameters', url: 'https://scikit-learn.org/stable/modules/grid_search.html' }, SKL],
  },
];
