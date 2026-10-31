import type { Module } from '../types.ts';
import { md } from './md.ts';

const D2L = { label: 'Dive into Deep Learning (free interactive book)', url: 'https://d2l.ai/' };
const FASTAI = { label: 'fast.ai — Practical Deep Learning for Coders (free)', url: 'https://course.fast.ai/' };

export const m11: Module = {
  id: 'advanced',
  number: 11,
  title: 'Advanced Data Science',
  short: 'Advanced Topics',
  icon: 'rocket',
  description:
    'A guided introduction to specialisations. ESSENTIAL for every data scientist: neural-network fundamentals, time series & forecasting, and how generative AI/LLMs work and are used. OPTIONAL specialisations: TensorFlow & PyTorch, NLP, computer vision and big data — learn the concepts here, then go deeper in the one that matches your career goal.',
  skills: ['Neural networks', 'Time series forecasting', 'GenAI & LLMs', 'TensorFlow/PyTorch (optional)', 'NLP (optional)', 'Computer vision (optional)', 'Big data (optional)'],
  lessons: [
    {
      id: 'adv-neural-networks',
      title: 'Neural Networks & Deep Learning Fundamentals (Essential)',
      minutes: 50,
      difficulty: 'advanced',
      widgets: ['neuron'],
      objectives: [
        'Explain neurons, layers, weights, biases and activation functions',
        'Describe forward propagation, loss, backpropagation and gradient descent',
        'Implement a forward pass in NumPy and train an MLP with scikit-learn',
        'Know when deep learning is (and isn’t) the right tool',
      ],
      intro: md`
Deep learning powers image recognition, speech assistants, translation and large language models. At its core, a neural network is just many simple units (neurons) doing weighted sums and non-linear squashes — trained with the **gradient descent** you learned in Module 3.
`,
      simple: md`
A single **neuron** takes inputs, multiplies each by a **weight** (how important it is), adds a **bias**, and passes the result through an **activation function** that decides how strongly to “fire”. Play with one in the demo above.

A **neural network** stacks layers of neurons: the input layer receives the data, **hidden layers** transform it step by step, and the output layer gives the prediction. **Training** means showing many examples, measuring how wrong the predictions are, and nudging every weight slightly in the direction that reduces the error — millions of tiny corrections.
`,
      technical: md`
### A layer
$\mathbf{h} = \phi(W\mathbf{x} + \mathbf{b})$, where $W$ is a weight matrix, $\mathbf{b}$ a bias vector, $\phi$ an activation applied element-wise. Stacking layers: $\hat{y} = f_L(\dots f_2(f_1(\mathbf{x})))$.

### Activation functions
| Name | Formula | Use |
|---|---|---|
| ReLU | $\max(0, z)$ | default for hidden layers |
| Sigmoid | $1/(1+e^{-z})$ | binary output probability |
| Softmax | $e^{z_k}/\sum_j e^{z_j}$ | multi-class output |
| tanh | $\tanh z$ | older hidden layers / RNNs |

Without non-linear activations, stacked layers collapse into a single linear model.

### Training
1. **Forward pass:** compute predictions.
2. **Loss:** MSE (regression), cross-entropy (classification).
3. **Backpropagation:** the chain rule computes $\partial L/\partial w$ for every weight efficiently.
4. **Update:** $w \leftarrow w - \eta\,\partial L/\partial w$ with mini-batch SGD or **Adam**.
5. Repeat for many **epochs** (passes over the data).

Regularisation: weight decay (L2), **dropout**, **early stopping**, data augmentation. Normalise inputs.

### Architectures
- **MLP / dense networks:** tabular data (often beaten by gradient boosting there).
- **CNNs:** images (convolutions detect local patterns).
- **RNNs/LSTMs:** sequences (largely replaced by transformers).
- **Transformers:** attention-based; the architecture behind modern LLMs and many vision models.

### When to use deep learning
Large datasets of unstructured data (images, text, audio) → yes. Small tabular datasets → start with linear models and tree ensembles; they are usually as good, faster and more interpretable.
`,
      terms: [
        ['Neuron', 'Unit computing an activation of a weighted sum plus bias.'],
        ['Hidden layer', 'A layer between input and output.'],
        ['Activation function', 'Non-linear function applied to a neuron’s weighted sum (ReLU, sigmoid...).'],
        ['Backpropagation', 'Efficient computation of gradients via the chain rule.'],
        ['Epoch', 'One full pass through the training data.'],
        ['Adam', 'Popular adaptive gradient-descent optimiser.'],
        ['Dropout', 'Randomly disabling neurons during training to reduce overfitting.'],
        ['Early stopping', 'Stopping training when validation performance stops improving.'],
      ],
      realWorld: md`
Banks use neural networks to read cheques and detect card fraud in real time; hospitals use convolutional networks to flag possible tumours in scans for radiologists to review; streaming services use deep recommendation models. In each case the network learns its own features from raw data — pixels, transaction sequences, viewing histories — instead of relying on hand-crafted ones.
`,
      steps: [
        'Normalise the inputs.',
        'Choose an architecture: input size → hidden layers (ReLU) → output activation suited to the task.',
        'Pick a loss (cross-entropy/MSE) and an optimiser (Adam).',
        'Train for several epochs, monitoring validation loss; use early stopping.',
        'Compare with simpler baselines before adopting deep learning.',
      ],
      code: [
        {
          title: 'A forward pass through a tiny network in NumPy',
          code: md`
import numpy as np

def relu(z):
    return np.maximum(0, z)

def softmax(z):
    e = np.exp(z - z.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

rng = np.random.default_rng(0)
X = rng.normal(size=(4, 3))                    # 4 samples, 3 features
W1, b1 = rng.normal(size=(3, 5)) * 0.5, np.zeros(5)
W2, b2 = rng.normal(size=(5, 2)) * 0.5, np.zeros(2)

H = relu(X @ W1 + b1)                          # hidden layer: 5 neurons
P = softmax(H @ W2 + b2)                       # output: 2-class probabilities
print("hidden activations shape:", H.shape)
print("class probabilities:\n", P.round(3), "\nrows sum to:", P.sum(axis=1))

y = np.array([0, 1, 1, 0])
loss = -np.mean(np.log(P[np.arange(4), y]))
print("cross-entropy loss:", round(loss, 4))
`,
          explanation: [
            'ReLU keeps positive values and zeroes negatives — the standard hidden-layer activation.',
            'Softmax turns raw scores into probabilities that sum to 1; subtracting the row maximum keeps `exp` numerically stable.',
            'Random inputs: 4 samples with 3 features each.',
            'Layer 1 weights (3 inputs → 5 neurons) and biases.',
            'Layer 2 weights (5 → 2 outputs).',
            'Hidden layer = ReLU of the matrix product plus bias — the same `@` multiplication from Module 3, done for all samples at once.',
            'Output layer = softmax of another linear layer → one probability per class per sample.',
            'Shapes confirm (4, 5) hidden activations; probabilities sum to 1 per row.',
            'True labels for the 4 samples.',
            'Cross-entropy loss: average negative log-probability of the true class. Training would adjust W1, b1, W2, b2 with backpropagation to reduce this number.',
          ],
        },
        {
          title: 'Training a neural network with scikit-learn (MLP)',
          code: md`
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
import matplotlib.pyplot as plt

X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

mlp = make_pipeline(StandardScaler(),
                    MLPClassifier(hidden_layer_sizes=(64, 32), activation="relu", solver="adam",
                                  alpha=1e-3, early_stopping=True, max_iter=300, random_state=0))
mlp.fit(X_tr, y_tr)
logit = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_tr, y_tr)
print("MLP test accuracy:", round(mlp.score(X_te, y_te), 3), " logistic baseline:", round(logit.score(X_te, y_te), 3))

net = mlp.named_steps["mlpclassifier"]
plt.plot(net.loss_curve_, label="training loss")
plt.plot(net.validation_scores_, label="validation accuracy")
plt.xlabel("epoch"); plt.legend(); plt.title("Training progress"); plt.show()
print("epochs run (early stopping):", net.n_iter_)
`,
          explanation: [
            'The digits dataset: 1,797 8×8 images of handwritten digits flattened to 64 pixel features.',
            'Stratified train/test split.',
            'A pipeline: scale pixels, then an MLP with two hidden layers (64 and 32 ReLU neurons), Adam optimiser, L2 penalty `alpha`, and **early stopping** on an internal validation split.',
            'Train the network.',
            'A logistic-regression baseline for comparison.',
            'The MLP reaches ~97% accuracy, beating the linear baseline.',
            'Access the trained network inside the pipeline.',
            'Plot the training loss per epoch and the validation accuracy — the curves you monitor when training any deep model.',
            '`n_iter_` shows when early stopping ended training.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Reaching for deep learning on a 2,000-row tabular dataset.', fix: 'Start with linear models / gradient boosting; use deep learning for large unstructured data.' },
        { mistake: 'Not scaling inputs.', fix: 'Standardise or normalise features; it strongly affects training.' },
        { mistake: 'Training until training loss is minimal.', fix: 'Monitor validation loss and stop early to avoid overfitting.' },
      ],
      exercises: [
        {
          id: 'adv1-ex1', title: 'One neuron', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`neuron(x, w, b)\` returning the **sigmoid** of the weighted sum $w \cdot x + b$ (NumPy arrays x and w).`,
          starter: md`
import numpy as np

def neuron(x, w, b):
    return 0

print(neuron(np.array([1.0, 0.5]), np.array([1.5, -1.0]), 0.0))
`,
          solution: md`
import numpy as np

def neuron(x, w, b):
    z = np.dot(w, x) + b
    return 1 / (1 + np.exp(-z))

print(neuron(np.array([1.0, 0.5]), np.array([1.5, -1.0]), 0.0))
`,
          tests: md`
assert abs(neuron(np.array([1.0, 0.5]), np.array([1.5, -1.0]), 0.0) - 1 / (1 + np.exp(-1.0))) < 1e-9
assert abs(neuron(np.array([0.0, 0.0]), np.array([3.0, 3.0]), 0.0) - 0.5) < 1e-9, "z = 0 gives 0.5"
`,
          hints: ['z = np.dot(w, x) + b', 'sigmoid(z) = 1 / (1 + np.exp(-z))'],
        },
        {
          id: 'adv1-ex2', title: 'Train an MLP', type: 'dataset', lang: 'python', difficulty: 'advanced',
          prompt: md`
Train \`make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32,), max_iter=500, random_state=1))\` on the breast-cancer training split and store the **test** accuracy in \`acc\`.
`,
          starter: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neural_network import MLPClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
acc = 0
`,
          solution: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neural_network import MLPClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
model = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32,), max_iter=500, random_state=1))
acc = model.fit(X_tr, y_tr).score(X_te, y_te)
print(round(acc, 3))
`,
          tests: md`
_m = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(32,), max_iter=500, random_state=1))
_a = _m.fit(X_tr, y_tr).score(X_te, y_te)
assert abs(acc - _a) < 1e-9 and acc > 0.93, f"Expected {_a:.3f}, got {acc}"
`,
          hints: ['Build the pipeline, `.fit(X_tr, y_tr)`, then `.score(X_te, y_te)`.'],
        },
        {
          id: 'adv1-ex3', title: 'Why non-linearity?', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`If a 5-layer network uses **no** activation functions (only linear layers), it is mathematically equivalent to a network with how many linear layers?`,
          solution: '1', accepted: ['1', 'one', 'a single layer', 'single'],
          hints: ['A product of matrices is still a single matrix.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does backpropagation compute?', options: ['Predictions', 'Gradients of the loss with respect to every weight', 'The learning rate', 'The number of layers'], answer: 1, explanation: 'Via the chain rule, efficiently.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'The most common activation for hidden layers today is…', options: ['Sigmoid', 'ReLU', 'Linear', 'Softmax'], answer: 1, explanation: 'ReLU trains well and is cheap to compute.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which output activation fits 10-class digit classification?', options: ['ReLU', 'Softmax', 'Linear', 'tanh'], answer: 1, explanation: 'Softmax outputs a probability distribution over classes.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Early stopping helps prevent…', options: ['Underfitting', 'Overfitting', 'Data leakage', 'Slow loading'], answer: 1, explanation: 'Stop when validation performance peaks.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'For a 5,000-row tabular churn dataset, the best first choice is usually…', options: ['A 50-layer CNN', 'Gradient boosting / logistic regression baselines', 'A transformer', 'An RNN'], answer: 1, explanation: 'Deep learning shines on large unstructured data.' },
      ],
      summary: [
        'Layers compute φ(Wx + b); non-linear activations make depth useful.',
        'Training: forward pass → loss → backprop → gradient update, over epochs.',
        'Regularise with weight decay, dropout, early stopping; normalise inputs.',
        'Use deep learning for large unstructured data; baselines first for tabular.',
      ],
      resources: [D2L, { label: '3Blue1Brown — Neural networks series', url: 'https://www.3blue1brown.com/topics/neural-networks' }],
    },
    {
      id: 'adv-tf-pytorch',
      title: 'TensorFlow/Keras & PyTorch (Optional Specialization)',
      minutes: 35,
      difficulty: 'advanced',
      optional: true,
      objectives: [
        'Know what deep-learning frameworks provide: tensors, autograd, layers, optimisers, GPU support',
        'Read and write a basic Keras model (compile/fit/evaluate)',
        'Read and write a basic PyTorch training loop',
        'Set up a practical environment (Google Colab with GPU) to run them',
      ],
      intro: md`
For real deep-learning projects you will use a framework: **TensorFlow/Keras** (popular in industry and production) or **PyTorch** (dominant in research and increasingly in industry). They handle tensors, automatic differentiation and GPUs so you can focus on the model. These libraries don’t run in this browser environment, so the code here is read-only — run it in Google Colab.
`,
      simple: md`
Writing backpropagation by hand for millions of weights would be impossible. Frameworks do it for you:
- You describe the layers.
- They automatically work out all the gradients (**autograd**).
- They run on **GPUs** — graphics cards that do thousands of multiplications in parallel — making training 10–100× faster.

**Keras** is like ordering from a menu: *compile* the model, *fit* it, done. **PyTorch** is like cooking yourself: you write the training loop, which gives full control.
`,
      technical: md`
### Common concepts
| Concept | Keras (TensorFlow) | PyTorch |
|---|---|---|
| Tensor | \`tf.Tensor\` | \`torch.Tensor\` |
| Model | \`keras.Sequential([...])\` / functional API | subclass \`nn.Module\` |
| Dense layer | \`layers.Dense(64, activation="relu")\` | \`nn.Linear(in, 64)\` + \`nn.ReLU()\` |
| Loss | \`loss="sparse_categorical_crossentropy"\` | \`nn.CrossEntropyLoss()\` |
| Optimiser | \`optimizer="adam"\` | \`torch.optim.Adam(model.parameters())\` |
| Training | \`model.fit(X, y, epochs, validation_split)\` | manual loop: zero_grad → forward → loss → backward → step |
| GPU | automatic if available | \`model.to("cuda")\`, tensors \`.to(device)\` |
| Data | \`tf.data.Dataset\` | \`Dataset\` + \`DataLoader\` |

### Choosing
Both are excellent; concepts transfer. Many job ads ask for “TensorFlow **or** PyTorch”. Pick one and learn it well; Hugging Face libraries support both.

### Getting started
- **Google Colab:** free notebooks with GPUs (Runtime → Change runtime type → GPU); TensorFlow and PyTorch are pre-installed.
- Local: \`pip install tensorflow\` or follow pytorch.org’s install selector (CPU or CUDA version).
- **Transfer learning:** start from a pre-trained model (e.g. ResNet, BERT) and fine-tune it — the most practical way to use deep learning with limited data.
`,
      terms: [
        ['Tensor', 'Multi-dimensional array used by deep-learning frameworks (like a NumPy array that can live on a GPU).'],
        ['Autograd', 'Automatic computation of gradients.'],
        ['GPU', 'Graphics processor that accelerates parallel matrix math.'],
        ['Keras', 'High-level deep-learning API in TensorFlow.'],
        ['nn.Module', 'Base class for PyTorch models.'],
        ['DataLoader', 'PyTorch utility for batching and shuffling data.'],
        ['Transfer learning', 'Fine-tuning a model pre-trained on a large dataset.'],
      ],
      realWorld: md`
A startup with only 2,000 labelled product photos needs a defect classifier. Training a CNN from scratch would overfit, so they load a ResNet pre-trained on ImageNet in PyTorch, replace the last layer, and fine-tune for 10 epochs on a free Colab GPU — reaching 96% accuracy in an afternoon.
`,
      steps: [
        'Open Google Colab and enable a GPU runtime.',
        'Load and normalise data; split train/validation/test.',
        'Define the model (Sequential in Keras, nn.Module in PyTorch).',
        'Train with an optimiser and loss; monitor validation metrics.',
        'Evaluate on the test set; save the model (`model.save` / `torch.save`).',
      ],
      code: [
        {
          title: 'Keras: digit classifier (run in Colab)',
          runnable: false,
          code: md`
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

model = keras.Sequential([
    layers.Input(shape=(28, 28)),
    layers.Flatten(),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.2),
    layers.Dense(10, activation="softmax"),
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
history = model.fit(x_train, y_train, epochs=5, validation_split=0.1,
                    callbacks=[keras.callbacks.EarlyStopping(patience=2, restore_best_weights=True)])
print(model.evaluate(x_test, y_test))
`,
          explanation: [
            'Import TensorFlow and its high-level Keras API.',
            'MNIST: 70,000 28×28 handwritten digits, downloaded automatically.',
            'Scale pixel values from 0–255 to 0–1.',
            'A Sequential model lists layers in order: input shape…',
            '…flatten each image into 784 numbers…',
            '…a hidden layer of 128 ReLU neurons…',
            '…dropout randomly disables 20% of them during training (regularisation)…',
            '…and a 10-way softmax output.',
            '`compile` chooses the optimiser, loss and metrics.',
            '`fit` trains for up to 5 epochs, holding out 10% for validation, stopping early if validation loss stops improving.',
            '`evaluate` reports test loss and accuracy (~98%).',
          ],
        },
        {
          title: 'PyTorch: the same model with an explicit training loop (run in Colab)',
          runnable: false,
          code: md`
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

device = "cuda" if torch.cuda.is_available() else "cpu"
train = datasets.MNIST("data", train=True, download=True, transform=transforms.ToTensor())
loader = DataLoader(train, batch_size=64, shuffle=True)

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(nn.Flatten(), nn.Linear(784, 128), nn.ReLU(), nn.Dropout(0.2), nn.Linear(128, 10))
    def forward(self, x):
        return self.layers(x)

model = Net().to(device)
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(3):
    model.train()
    for xb, yb in loader:
        xb, yb = xb.to(device), yb.to(device)
        optimizer.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        optimizer.step()
    print(f"epoch {epoch + 1}: last batch loss {loss.item():.4f}")
`,
          explanation: [
            'Import PyTorch, its neural-network module, the data loader and torchvision datasets.',
            'Use the GPU if one is available.',
            'Download MNIST as tensors.',
            '`DataLoader` yields shuffled mini-batches of 64 images.',
            'Models are classes inheriting from `nn.Module`…',
            '…layers are defined in `__init__`…',
            '…the same architecture as the Keras model…',
            '…and `forward` defines how data flows through them.',
            'Create the model on the chosen device.',
            'Cross-entropy loss (it applies softmax internally).',
            'Adam optimiser over all model parameters.',
            'The training loop, for 3 epochs:',
            'training mode (enables dropout)…',
            'for each mini-batch: move it to the device,',
            'reset gradients from the previous step,',
            'forward pass + loss,',
            '`backward()` runs backpropagation (autograd),',
            '`step()` updates the weights.',
            'Report progress.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Forgetting `optimizer.zero_grad()` in PyTorch (gradients accumulate).', fix: 'Zero gradients every step before `backward()`.' },
        { mistake: 'Training on CPU for hours.', fix: 'Use a GPU runtime (Colab) for deep learning.' },
        { mistake: 'Training from scratch with little data.', fix: 'Use transfer learning from a pre-trained model.' },
      ],
      exercises: [
        {
          id: 'adv2-ex1', title: 'Count parameters of a dense layer', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`A dense layer with \`n_in\` inputs and \`n_out\` neurons has \`n_in × n_out\` weights plus \`n_out\` biases. Write \`dense_params(n_in, n_out)\`, then compute \`total\` for the Keras model above (784→128→10).`,
          starter: md`
def dense_params(n_in, n_out):
    return 0

total = 0
print(total)
`,
          solution: md`
def dense_params(n_in, n_out):
    return n_in * n_out + n_out

total = dense_params(784, 128) + dense_params(128, 10)
print(total)
`,
          tests: md`
assert dense_params(3, 5) == 20
assert total == 101770, f"Expected 101,770 parameters, got {total}"
`,
          hints: ['784·128 + 128 = 100,480; 128·10 + 10 = 1,290.'],
        },
        {
          id: 'adv2-ex2', title: 'Order the PyTorch training step', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`Which call must come immediately **before** \`optimizer.step()\` in a PyTorch training loop? (write the method, e.g. \`loss.xxx()\`)`,
          solution: 'loss.backward()', accepted: ['loss.backward()', 'backward()', 'backward', 'loss.backward'],
          hints: ['Gradients must be computed before the optimiser can use them.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does autograd do?', options: ['Downloads datasets', 'Computes gradients automatically', 'Chooses hyperparameters', 'Plots loss curves'], answer: 1, explanation: 'Automatic differentiation.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Why are GPUs used for deep learning?', options: ['They store more files', 'They perform massively parallel matrix operations quickly', 'They are required by Python', 'They reduce overfitting'], answer: 1, explanation: 'Training is dominated by matrix math.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'In Keras, which method trains the model?', options: ['compile', 'fit', 'evaluate', 'predict'], answer: 1, explanation: 'compile configures; fit trains.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Transfer learning means…', options: ['Moving a model to another computer', 'Fine-tuning a model pre-trained on a large dataset for a new task', 'Copying data between GPUs', 'Converting Keras to PyTorch'], answer: 1, explanation: 'Reuse learned features.' },
      ],
      summary: [
        'Frameworks provide tensors, autograd, layers, optimisers and GPU acceleration.',
        'Keras: Sequential → compile → fit → evaluate.',
        'PyTorch: nn.Module + DataLoader + explicit loop (zero_grad, forward, backward, step).',
        'Use Colab GPUs and transfer learning to get results quickly.',
      ],
      resources: [{ label: 'Keras getting started', url: 'https://keras.io/getting_started/' }, { label: 'PyTorch tutorials', url: 'https://pytorch.org/tutorials/' }, FASTAI],
    },
    {
      id: 'adv-nlp',
      title: 'Natural Language Processing (Optional Specialization)',
      minutes: 40,
      difficulty: 'advanced',
      optional: true,
      objectives: [
        'Preprocess text: tokenisation, lower-casing, stop words, n-grams',
        'Represent text with bag-of-words and TF-IDF',
        'Build and evaluate a text classifier (sentiment analysis)',
        'Know where embeddings and transformers fit',
      ],
      intro: md`
Most of the world’s data is text: reviews, support tickets, emails, contracts, social media. **NLP** turns text into numbers models can use — enabling sentiment analysis, topic detection, spam filters, search and chatbots.
`,
      simple: md`
Computers don’t understand words, only numbers. The simplest trick: count words. The review *“great product, great price”* becomes \`great: 2, product: 1, price: 1\`. That’s a **bag of words** — order is lost, but it works surprisingly well.

**TF-IDF** improves it: words that appear in every document (“the”, “product”) get little weight; distinctive words (“broken”, “excellent”) get more. A classifier then learns which words signal positive or negative reviews.
`,
      technical: md`
### Pipeline
1. **Clean & normalise:** lower-case, remove punctuation/URLs, optionally stop words, stemming/lemmatisation.
2. **Tokenise:** split into words or sub-words; **n-grams** (pairs like “not good”) capture some word order.
3. **Vectorise:**
   - Bag of words: \`CountVectorizer\`.
   - **TF-IDF:** $\text{tfidf}(t, d) = \text{tf}(t, d)\cdot\log\frac{1 + N}{1 + \text{df}(t)} + 1$ (sklearn’s smoothed version), then each row is L2-normalised. \`TfidfVectorizer(ngram_range=(1, 2), min_df=2)\`.
4. **Model:** logistic regression, linear SVM or Naive Bayes work very well on sparse TF-IDF vectors.
5. **Evaluate:** precision/recall/F1; inspect the most influential words.

### Beyond counts
- **Word embeddings** (word2vec, GloVe): dense vectors where similar words are close (“king − man + woman ≈ queen”).
- **Transformers** (BERT, GPT): contextual embeddings; fine-tune pre-trained models with Hugging Face \`transformers\` for state-of-the-art accuracy.
- **Tasks:** classification, named-entity recognition, topic modelling (LDA), summarisation, translation, question answering.
`,
      terms: [
        ['Token', 'A unit of text (word, sub-word or character).'],
        ['Stop words', 'Very common words often removed (the, and, is).'],
        ['n-gram', 'Sequence of n consecutive tokens.'],
        ['Bag of words', 'Text represented by word counts, ignoring order.'],
        ['TF-IDF', 'Term frequency × inverse document frequency weighting.'],
        ['Embedding', 'Dense vector representation capturing meaning.'],
        ['Sentiment analysis', 'Classifying text as positive, negative or neutral.'],
      ],
      realWorld: md`
An airline receives 20,000 customer comments a month. A TF-IDF + logistic regression model routes each comment to a topic (baggage, delays, staff, food) and flags negative sentiment for follow-up. Analysts track topic trends on a dashboard and spot a spike in “baggage” complaints at one airport within days instead of months.
`,
      steps: [
        'Collect labelled examples (e.g. reviews with ratings).',
        'Split train/test; vectorise with TF-IDF fitted on training text only (pipeline).',
        'Train a linear classifier; evaluate with F1 and a confusion matrix.',
        'Inspect top-weighted words to sanity-check the model.',
        'For higher accuracy, fine-tune a pre-trained transformer.',
      ],
      code: [
        {
          title: 'Sentiment classifier with TF-IDF and logistic regression',
          code: md`
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score

pos = ["great product, works perfectly", "excellent quality and fast delivery", "love it, highly recommend",
       "very good value for the price", "amazing battery life", "works great, happy with it",
       "fantastic, exceeded expectations", "good sound and comfortable", "perfect fit, great price",
       "super fast shipping, excellent seller"]
neg = ["terrible, broke after one day", "very poor quality, not recommended", "awful customer service",
       "stopped working, waste of money", "not good, battery died quickly", "bad product, returned it",
       "cheap material, very disappointed", "arrived broken and late", "worst purchase ever",
       "not worth the price, poor sound"]
texts, labels = pos + neg, np.array([1] * len(pos) + [0] * len(neg))

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), stop_words="english"), LogisticRegression(C=10))
print("5-fold CV accuracy:", cross_val_score(model, texts, labels, cv=5).mean().round(2))
model.fit(texts, labels)

vec, clf = model.named_steps["tfidfvectorizer"], model.named_steps["logisticregression"]
words = np.array(vec.get_feature_names_out())
order = clf.coef_[0].argsort()
print("most negative terms:", list(words[order[:6]]))
print("most positive terms:", list(words[order[-6:]]))
for review in ["the quality is excellent", "broke quickly, very poor", "not good at all"]:
    print(f"{review!r} -> P(positive) = {model.predict_proba([review])[0, 1]:.2f}")
`,
          explanation: [
            'Imports: TF-IDF vectoriser, classifier, pipeline and cross-validation.',
            'A tiny labelled corpus of product reviews (real projects use thousands).',
            '…',
            'Combine texts and create labels (1 = positive, 0 = negative).',
            'Pipeline: TF-IDF with unigrams + bigrams (so “not good” is a feature) and English stop words removed, then logistic regression.',
            'Cross-validated accuracy (with so little data, expect some variance).',
            'Fit on all examples to inspect the model.',
            'Access the fitted vectoriser and classifier.',
            'Vocabulary terms…',
            '…sorted by coefficient: most negative and most positive words — a quick sanity check of what the model learned.',
            'Score new reviews with predicted probabilities.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Fitting the vectoriser on all data before splitting.', fix: 'Put TfidfVectorizer in the pipeline.' },
        { mistake: 'Removing “not” and other negations as stop words for sentiment.', fix: 'Use bigrams and check stop-word lists for your task.' },
        { mistake: 'Trusting accuracy on imbalanced text classes.', fix: 'Report precision/recall/F1 per class.' },
      ],
      exercises: [
        {
          id: 'adv3-ex1', title: 'Word counts', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Write \`bag_of_words(text)\` returning a dict of lower-cased word counts, splitting on whitespace and stripping the punctuation characters \`.,!?\` from each word.`,
          starter: md`
def bag_of_words(text):
    return {}

print(bag_of_words("Great product, great price!"))
`,
          solution: md`
def bag_of_words(text):
    counts = {}
    for word in text.lower().split():
        w = word.strip(".,!?")
        if w:
            counts[w] = counts.get(w, 0) + 1
    return counts

print(bag_of_words("Great product, great price!"))
`,
          tests: md`
assert bag_of_words("Great product, great price!") == {"great": 2, "product": 1, "price": 1}
assert bag_of_words("Hi! hi? HI.") == {"hi": 3}
`,
          hints: ['Lower-case, split, then `word.strip(".,!?")`.', 'Count with `d[w] = d.get(w, 0) + 1`.'],
        },
        {
          id: 'adv3-ex2', title: 'TF-IDF vocabulary size', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Fit \`TfidfVectorizer()\` (default settings) on \`docs\` and store the resulting matrix in \`M\` and the number of distinct terms in \`n_terms\`.`,
          starter: md`
from sklearn.feature_extraction.text import TfidfVectorizer
docs = ["the cat sat", "the dog sat", "the cat ran fast"]
M = None
n_terms = 0
`,
          solution: md`
from sklearn.feature_extraction.text import TfidfVectorizer
docs = ["the cat sat", "the dog sat", "the cat ran fast"]
vec = TfidfVectorizer()
M = vec.fit_transform(docs)
n_terms = len(vec.get_feature_names_out())
print(M.shape, vec.get_feature_names_out())
`,
          tests: md`
assert M is not None and M.shape == (3, 6), f"Expected a 3x6 matrix, got {getattr(M, 'shape', None)}"
assert n_terms == 6
`,
          hints: ['`fit_transform(docs)` returns a sparse matrix with one row per document.', 'Terms: cat, dog, fast, ran, sat, the.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'TF-IDF gives a low weight to words that…', options: ['Appear in very few documents', 'Appear in almost every document', 'Are long', 'Are nouns'], answer: 1, explanation: 'High document frequency → low IDF.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why use bigrams for sentiment?', options: ['They are faster', 'They capture short phrases like “not good”', 'They remove stop words', 'They reduce vocabulary size'], answer: 1, explanation: 'Some meaning depends on word pairs.' },
        { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: 'A bag-of-words representation ignores…', options: ['Word counts', 'Word order', 'The vocabulary', 'Document length'], answer: 1, explanation: 'Only counts remain.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Transformers like BERT produce embeddings that are…', options: ['Identical for a word in every sentence', 'Contextual: the same word gets different vectors in different contexts', 'Always one-hot', 'Not usable for classification'], answer: 1, explanation: '“bank” of a river vs a bank account.' },
      ],
      summary: [
        'Text → tokens → vectors (bag of words, TF-IDF) → model.',
        'Linear models on TF-IDF are strong, fast baselines.',
        'Use pipelines, n-grams and careful stop-word choices.',
        'Embeddings and fine-tuned transformers give state-of-the-art results.',
      ],
      resources: [{ label: 'scikit-learn: Text feature extraction', url: 'https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction' }, { label: 'Hugging Face NLP course (free)', url: 'https://huggingface.co/learn/nlp-course' }],
    },
    {
      id: 'adv-computer-vision',
      title: 'Computer Vision (Optional Specialization)',
      minutes: 35,
      difficulty: 'advanced',
      optional: true,
      objectives: [
        'Represent images as arrays of pixel values (grayscale and RGB)',
        'Explain convolution filters and how CNNs learn them',
        'Classify small images with classical ML as a baseline',
        'Know the main CV tasks: classification, detection, segmentation',
      ],
      intro: md`
Computer vision teaches machines to interpret images and video: reading licence plates, detecting defects on production lines, analysing medical scans, powering self-driving cars. Underneath, an image is just a grid of numbers — and the tools you know (arrays, models) apply directly.
`,
      simple: md`
A digital photo is a grid of tiny squares (**pixels**). In a grayscale image each pixel is a number from 0 (black) to 255 (white); colour images have three numbers per pixel (red, green, blue).

A **convolution** slides a small window (like a 3×3 magnifying glass) across the image and computes a weighted sum at each position — some windows detect edges, others corners or textures. A **CNN** learns which windows (filters) are useful, stacking them to recognise eyes, wheels, and eventually whole objects.
`,
      technical: md`
### Images as arrays
Grayscale: shape \`(H, W)\`; colour: \`(H, W, 3)\`; a batch: \`(N, H, W, C)\`. Normalise pixel values to [0, 1] or standardise.

### Convolution
For a kernel $K$ of size $k \times k$: $(I * K)[i, j] = \sum_{u,v} I[i+u, j+v]\,K[u, v]$. Edge-detection kernels (Sobel) highlight intensity changes. **Stride** (step size) and **padding** control output size; **pooling** (max-pool) downsamples.

### CNN architecture
Conv → ReLU → Pool blocks extract increasingly abstract features; a final dense layer classifies. Weight sharing makes CNNs far more efficient than dense networks on images. Famous architectures: LeNet, AlexNet, VGG, ResNet, EfficientNet; Vision Transformers (ViT) are now competitive.

### Tasks
- **Classification:** one label per image.
- **Object detection:** bounding boxes + labels (YOLO, Faster R-CNN).
- **Segmentation:** a label per pixel (U-Net).
- **OCR, pose estimation, image generation (diffusion models).**

### Practical tips
**Data augmentation** (flips, rotations, crops) and **transfer learning** are essential with limited data. Tools: OpenCV, Pillow, torchvision, Keras applications.
`,
      terms: [
        ['Pixel', 'The smallest element of an image, holding intensity/colour values.'],
        ['Channel', 'One colour component (R, G, B) of an image.'],
        ['Convolution', 'Sliding a kernel over an image computing weighted sums.'],
        ['Kernel / filter', 'Small weight matrix used in convolution.'],
        ['Pooling', 'Downsampling feature maps (e.g. max of each 2×2 block).'],
        ['CNN', 'Convolutional neural network.'],
        ['Data augmentation', 'Creating modified copies of training images to improve generalisation.'],
      ],
      realWorld: md`
A food-processing plant uses cameras on a conveyor belt and a CNN fine-tuned from ResNet to reject bruised fruit. The model was trained on 3,000 labelled images with augmentation (rotations, brightness changes). It inspects 20 items per second — work that previously required several staff members.
`,
      steps: [
        'Load images as arrays and inspect shapes and value ranges.',
        'Normalise and split; build a simple baseline (e.g. logistic regression on pixels).',
        'Train a CNN (ideally fine-tuning a pre-trained model) with augmentation.',
        'Evaluate with a confusion matrix; look at misclassified images.',
        'Deploy with monitoring for lighting/camera changes (data drift).',
      ],
      code: [
        {
          title: 'Images are arrays: convolution by hand and a pixel-based classifier',
          code: md`
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import confusion_matrix

digits = load_digits()
img = digits.images[0]
print("image shape:", img.shape, " pixel range:", img.min(), "-", img.max())

def convolve2d(image, kernel):
    k = kernel.shape[0]
    out = np.zeros((image.shape[0] - k + 1, image.shape[1] - k + 1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i, j] = np.sum(image[i:i + k, j:j + k] * kernel)
    return out

sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
edges = convolve2d(img, sobel_x)

fig, ax = plt.subplots(1, 3, figsize=(9, 3))
ax[0].imshow(img, cmap="gray"); ax[0].set_title(f"digit {digits.target[0]}")
ax[1].imshow(sobel_x, cmap="coolwarm"); ax[1].set_title("vertical-edge kernel")
ax[2].imshow(edges, cmap="gray"); ax[2].set_title("convolution output")
for a in ax: a.axis("off")
plt.show()

X_tr, X_te, y_tr, y_te = train_test_split(digits.data / 16, digits.target, test_size=0.25, random_state=0)
svm = SVC(gamma=0.05).fit(X_tr, y_tr)
print("SVM on raw pixels — test accuracy:", round(svm.score(X_te, y_te), 3))
print(confusion_matrix(y_te, svm.predict(X_te)))
`,
          explanation: [
            'NumPy, plotting, the digits images and an SVM.',
            'Each digit is an 8×8 grayscale image with values 0–16.',
            'A simple 2-D convolution: for each position, multiply the 3×3 window element-wise by the kernel and sum — exactly what a CNN layer does (with learned kernels and many channels).',
            '…',
            '…',
            '…',
            '…',
            'The Sobel kernel responds to left-to-right intensity changes, i.e. vertical edges.',
            'Apply it to the image.',
            'Show the original image, the kernel and the edge map side by side.',
            '…',
            '…',
            'Hide axes for image plots.',
            'A classical baseline: treat the 64 pixels as features (scaled to 0–1)…',
            '…and train an RBF SVM: ~99% accuracy on this easy dataset.',
            'The confusion matrix shows which digits are confused (rows = true, columns = predicted).',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Feeding unnormalised 0–255 pixels to a network.', fix: 'Scale to [0, 1] or standardise.' },
        { mistake: 'Training a CNN from scratch on a few hundred images.', fix: 'Use transfer learning and augmentation.' },
        { mistake: 'Evaluating on images very similar to training ones (same patient/scene).', fix: 'Split by source (patient, camera, day) to avoid leakage.' },
      ],
      exercises: [
        {
          id: 'adv4-ex1', title: 'Implement convolution output size', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`With no padding and stride 1, a k×k kernel on an H×W image gives an output of size (H − k + 1) × (W − k + 1). Write \`conv_output_shape(h, w, k)\` returning that tuple.`,
          starter: md`
def conv_output_shape(h, w, k):
    return (0, 0)

print(conv_output_shape(28, 28, 3))
`,
          solution: md`
def conv_output_shape(h, w, k):
    return (h - k + 1, w - k + 1)

print(conv_output_shape(28, 28, 3))
`,
          tests: md`
assert conv_output_shape(28, 28, 3) == (26, 26)
assert conv_output_shape(8, 10, 5) == (4, 6)
`,
          hints: ['The window can start at H − k + 1 positions vertically.'],
        },
        {
          id: 'adv4-ex2', title: 'Brightness of an image', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`Using \`load_digits()\`, compute \`mean_pixel\`: the mean pixel value of the **first** image (\`digits.images[0]\`).`,
          starter: md`
from sklearn.datasets import load_digits
digits = load_digits()
mean_pixel = 0
`,
          solution: md`
from sklearn.datasets import load_digits
digits = load_digits()
mean_pixel = digits.images[0].mean()
print(mean_pixel)
`,
          tests: md`assert abs(mean_pixel - load_digits().images[0].mean()) < 1e-12`,
          hints: ['An image is a NumPy array: `.mean()` works directly.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A 32×32 colour (RGB) image has how many numbers?', options: ['1,024', '3,072', '32', '96'], answer: 1, explanation: '32 × 32 × 3.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'What do CNN filters learn?', options: ['Labels', 'Local patterns like edges and textures', 'The learning rate', 'Image file formats'], answer: 1, explanation: 'Early layers find edges; deeper ones find parts and objects.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Drawing boxes around every car in an image is…', options: ['Classification', 'Object detection', 'Segmentation', 'Clustering'], answer: 1, explanation: 'Detection = boxes + labels.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why use data augmentation?', options: ['To make images smaller', 'To create varied training examples and improve generalisation', 'To label data automatically', 'To speed up inference'], answer: 1, explanation: 'Models learn invariance to flips, rotations, lighting.' },
      ],
      summary: [
        'Images are arrays (H, W, C); normalise pixel values.',
        'Convolution slides kernels to detect local patterns; CNNs learn the kernels.',
        'Tasks: classification, detection, segmentation; use transfer learning and augmentation.',
        'Classical baselines on pixels are useful for small, simple images.',
      ],
      resources: [{ label: 'CS231n — CNNs for Visual Recognition (notes)', url: 'https://cs231n.github.io/' }, FASTAI],
    },
    {
      id: 'adv-time-series',
      title: 'Time Series Analysis & Forecasting (Essential)',
      minutes: 50,
      difficulty: 'advanced',
      objectives: [
        'Work with dates in pandas: datetime index, resample, rolling windows',
        'Decompose a series into trend, seasonality and noise',
        'Build naive, seasonal-naive and lag-feature regression forecasts',
        'Evaluate forecasts with time-based splits and MAE/MAPE',
      ],
      intro: md`
Sales, website traffic, stock prices, energy demand, pandemic cases — much business data is a **time series**. Forecasting it drives inventory, staffing and budgeting decisions. Time series need special care: order matters, observations are correlated, and you must never use the future to predict the past.
`,
      simple: md`
A time series is a value measured repeatedly over time, like daily sales. It usually contains:
- a **trend** (slowly going up or down),
- **seasonality** (repeating patterns — weekends, December),
- and **noise** (random ups and downs).

The simplest forecast is “tomorrow will be like today” (**naive**) or “this Monday will be like last Monday” (**seasonal naive**). Any fancier model must beat these baselines. And when testing a forecast, you always train on the **past** and test on the **future** — like a real forecaster would.
`,
      technical: md`
### pandas for time series
- \`pd.to_datetime\`, \`set_index("date")\`, \`.asfreq("D")\` (regular frequency, exposes gaps).
- **Resampling:** \`s.resample("W").sum()\`, \`"ME"\` (month end), \`"QE"\`.
- **Rolling windows:** \`s.rolling(7).mean()\` (moving average), \`.rolling(30).std()\` (volatility).
- **Shifts and differences:** \`s.shift(1)\` (lag), \`s.diff()\`, \`s.pct_change()\` (returns).

### Components
Additive model $y_t = T_t + S_t + \varepsilon_t$ (multiplicative when seasonality grows with the level). Estimate the trend with a centred moving average; seasonality as average deviations per season (\`statsmodels.tsa.seasonal_decompose\` automates this).

### Stationarity & autocorrelation
A **stationary** series has constant mean/variance over time; differencing often helps. **Autocorrelation** (ACF) measures correlation with lagged values — strong spikes at lag 7 indicate weekly seasonality.

### Forecasting methods
| Method | Idea |
|---|---|
| Naive | $\hat{y}_{t+1} = y_t$ |
| Seasonal naive | $\hat{y}_{t} = y_{t-m}$ (m = season length) |
| Moving average / exponential smoothing | weighted recent history (Holt-Winters adds trend & seasonality) |
| ARIMA / SARIMA | autoregressive + moving-average models on differenced data (\`statsmodels\`) |
| ML with lag features | regression/gradient boosting on lags, rolling stats, calendar features |
| Prophet, deep learning | additional tools for complex series |

### Evaluation
Use a **time-based split** (train on the first 80% of time, test on the rest) or \`TimeSeriesSplit\` / rolling-origin evaluation. Metrics: MAE, RMSE, **MAPE** = mean(|error| / actual). Compare with naive baselines; forecasts become less certain further ahead (report intervals where possible).

### Finance note
Stock prices are close to a random walk: past prices alone rarely predict future returns. Model **returns** and **volatility** rather than prices, and be sceptical of “perfect” backtests.
`,
      terms: [
        ['Time series', 'Observations indexed by time in order.'],
        ['Trend', 'Long-term increase or decrease.'],
        ['Seasonality', 'Regular repeating pattern with a fixed period.'],
        ['Resampling', 'Changing the time frequency (daily → weekly).'],
        ['Lag', 'A past value of the series used as a feature.'],
        ['Stationarity', 'Statistical properties constant over time.'],
        ['Autocorrelation', 'Correlation of a series with its own lagged values.'],
        ['MAPE', 'Mean absolute percentage error.'],
      ],
      realWorld: md`
A supermarket chain forecasts daily demand for 30,000 products per store to order fresh stock. Over-ordering wastes food; under-ordering loses sales. Their system combines seasonal patterns (weekday, holidays), weather and promotions in gradient-boosted models with lag features — and is benchmarked every week against a seasonal-naive forecast to prove it adds value.
`,
      steps: [
        'Parse dates, set a datetime index, check frequency and gaps.',
        'Plot the series with rolling means; look for trend and seasonality.',
        'Split by time: train on the past, test on the most recent period.',
        'Compute naive and seasonal-naive baselines.',
        'Build lag/calendar features and a regression model; compare MAE/MAPE with the baselines.',
      ],
      code: [
        {
          title: 'Resampling, rolling means and decomposition by hand',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
daily = sales.set_index("order_date")["revenue"].resample("D").sum()
print("days:", len(daily), " zero-revenue days:", int((daily == 0).sum()))

weekly = daily.resample("W").sum()
monthly = daily.resample("ME").sum()
trend = weekly.rolling(8, center=True).mean()

fig, ax = plt.subplots(2, 1, figsize=(10, 6))
ax[0].plot(weekly.index, weekly.values, alpha=0.5, label="weekly revenue")
ax[0].plot(trend.index, trend.values, color="red", label="8-week centred moving average (trend)")
ax[0].legend(); ax[0].set_title("Trend")
season = monthly.groupby(monthly.index.month).mean() / monthly.mean()
ax[1].bar(season.index, season.values, color="#6366f1")
ax[1].axhline(1, color="grey"); ax[1].set_title("Seasonal index by month (1 = average)"); ax[1].set_xticks(range(1, 13))
plt.tight_layout(); plt.show()
print("seasonal index:", season.round(2).to_dict())
`,
          explanation: [
            'Load the retail sales with real dates.',
            'Set the date as the index and `resample("D").sum()` to get total revenue for **every** calendar day (days without orders become 0).',
            'Check how many days had no sales.',
            'Aggregate to weekly and month-end totals.',
            'A centred 8-week moving average smooths noise and reveals the **trend**.',
            'Two stacked plots.',
            'Weekly revenue with its trend line.',
            '…',
            '**Seasonal index:** average revenue for each calendar month divided by the overall monthly mean; values above 1 mark busy months.',
            'November–December stand out (holiday season) — a multiplicative seasonal pattern.',
            '…',
            'Print the indices.',
          ],
        },
        {
          title: 'Forecasting with baselines and lag features (time-based split)',
          code: md`
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

cv = pd.read_csv("data/pandemic_cases.csv", parse_dates=["date"])
s = cv[cv["country"] == "Borealia"].set_index("date")["new_cases"].asfreq("D").interpolate()

df = pd.DataFrame({"y": s})
for lag in [1, 7, 14]:
    df[f"lag_{lag}"] = df["y"].shift(lag)
df["roll7"] = df["y"].shift(1).rolling(7).mean()
df["dow"] = df.index.dayofweek
df = pd.get_dummies(df, columns=["dow"], drop_first=True, dtype=int).dropna()

split = df.index[int(len(df) * 0.8)]
train, test = df[df.index < split], df[df.index >= split]
X_cols = [c for c in df.columns if c != "y"]

preds = {
    "naive (yesterday)": test["lag_1"],
    "seasonal naive (last week)": test["lag_7"],
    "linear regression on lags": LinearRegression().fit(train[X_cols], train["y"]).predict(test[X_cols]),
}
for name, p in preds.items():
    mae = mean_absolute_error(test["y"], p)
    mape = np.mean(np.abs(test["y"] - p) / test["y"]) * 100
    print(f"{name:28s} MAE={mae:8.1f}  MAPE={mape:5.1f}%")
print("train ends:", train.index.max().date(), " test:", test.index.min().date(), "to", test.index.max().date())
`,
          explanation: [
            'Imports for modelling and evaluation.',
            'Synthetic daily case counts; take one country, make the index a regular daily frequency, and fill the few reporting gaps by interpolation.',
            'Build a supervised table: target `y`…',
            '…lag features from 1, 7 and 14 days earlier…',
            '…a 7-day rolling mean of **past** values (`shift(1)` first, so today’s value never leaks into its own feature)…',
            '…and the day of week (weekend under-reporting), one-hot encoded; drop the first rows that have missing lags.',
            '**Time-based split:** the first 80% of dates for training, the last 20% for testing — no shuffling.',
            'Features = every column except the target.',
            'Three forecasts for the test period: yesterday’s value, last week’s value, and a regression on the lag/calendar features.',
            'Compare MAE and MAPE: the regression typically beats both naive baselines because it combines recent level and weekly pattern.',
            'Show the date ranges to confirm training data precedes test data.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Randomly shuffling time series into train/test sets.', fix: 'Split by time; use TimeSeriesSplit for CV.' },
        { mistake: 'Rolling features that include the current value (leakage).', fix: 'Shift before rolling: `y.shift(1).rolling(7).mean()`.' },
        { mistake: 'Skipping naive baselines.', fix: 'Always report naive and seasonal-naive errors.' },
        { mistake: 'Modelling stock prices directly and trusting a backtest.', fix: 'Model returns; beware look-ahead bias and overfitting.' },
      ],
      exercises: [
        {
          id: 'adv5-ex1', title: 'Weekly revenue', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`From \`data/sales.csv\`, create \`weekly\`: total revenue per week using a datetime index and \`resample("W").sum()\`.`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
weekly = None
print(weekly)
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
weekly = sales.set_index("order_date")["revenue"].resample("W").sum()
print(weekly.head())
`,
          tests: md`
assert weekly is not None and isinstance(weekly.index, pd.DatetimeIndex), "Index should be dates"
assert abs(weekly.sum() - sales["revenue"].sum()) < 1e-6, "Weekly totals should add up to total revenue"
assert len(weekly) >= 100, "Two years ≈ 105 weeks"
`,
          hints: ['`sales.set_index("order_date")["revenue"]` then `.resample("W").sum()`.'],
        },
        {
          id: 'adv5-ex2', title: 'Seasonal-naive forecast error', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`
Using \`s\` in the starter (daily cases for Avalon), forecast each of the **last 60 days** with the value from **7 days earlier** and store the MAE in \`mae\`.
`,
          starter: md`
import numpy as np
import pandas as pd
cv = pd.read_csv("data/pandemic_cases.csv", parse_dates=["date"])
s = cv[cv["country"] == "Avalon"].set_index("date")["new_cases"].asfreq("D").interpolate()
mae = 0
`,
          solution: md`
import numpy as np
import pandas as pd
cv = pd.read_csv("data/pandemic_cases.csv", parse_dates=["date"])
s = cv[cv["country"] == "Avalon"].set_index("date")["new_cases"].asfreq("D").interpolate()
forecast = s.shift(7)
actual_last = s.iloc[-60:]
mae = np.mean(np.abs(actual_last - forecast.iloc[-60:]))
print(round(mae, 2))
`,
          tests: md`
_f = s.shift(7)
_e = np.mean(np.abs(s.iloc[-60:] - _f.iloc[-60:]))
assert abs(mae - _e) < 1e-9, f"Expected {_e:.2f}, got {mae}"
`,
          hints: ['`s.shift(7)` aligns each day with the value 7 days earlier.', 'Compare the last 60 values of both series.'],
        },
        {
          id: 'adv5-ex3', title: 'Leak-free rolling feature', type: 'debug', lang: 'python', difficulty: 'advanced',
          prompt: md`\`feature\` should be the mean of the **previous** 3 values (not including the current one). Fix the leakage so that \`feature.iloc[3] == 2.0\` for the series 1, 2, 3, 4, 5…`,
          starter: md`
import pandas as pd
y = pd.Series([1.0, 2, 3, 4, 5, 6])
feature = y.rolling(3).mean()
print(feature.tolist())
`,
          solution: md`
import pandas as pd
y = pd.Series([1.0, 2, 3, 4, 5, 6])
feature = y.shift(1).rolling(3).mean()
print(feature.tolist())
`,
          tests: md`
assert feature.iloc[3] == 2.0, f"feature at index 3 should average 1, 2, 3 = 2.0, got {feature.iloc[3]}"
assert pd.isna(feature.iloc[2]), "Index 2 has only 2 previous values, so it should be NaN"
`,
          hints: ['Shift the series by one step before rolling.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Higher sales every December is an example of…', options: ['Trend', 'Seasonality', 'Noise', 'Stationarity'], answer: 1, explanation: 'A repeating calendar pattern.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'How should you split time series for evaluation?', options: ['Random 80/20 split', 'Train on earlier dates, test on later dates', 'Test on the first month', 'No split needed'], answer: 1, explanation: 'Mimic real forecasting.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A seasonal-naive forecast for daily data with weekly seasonality uses…', options: ['Yesterday’s value', 'The value 7 days earlier', 'The overall mean', 'A random value'], answer: 1, explanation: 'Same weekday last week.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: '`s.resample("ME").sum()` produces…', options: ['Daily values', 'Monthly totals', 'A 7-day moving average', 'Lagged values'], answer: 1, explanation: 'ME = month end frequency.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Why do analysts model stock **returns** instead of prices?', options: ['Returns are always positive', 'Prices are non-stationary (random-walk-like); returns are closer to stationary', 'Returns are easier to download', 'Prices cannot be plotted'], answer: 1, explanation: 'Differencing/returns stabilise the series.' },
      ],
      summary: [
        'Use datetime indexes, resample, rolling windows, shift/diff in pandas.',
        'Series = trend + seasonality + noise; check autocorrelation.',
        'Baselines: naive and seasonal naive; then smoothing, ARIMA or ML with lag features.',
        'Split by time, avoid look-ahead leakage, evaluate with MAE/MAPE.',
      ],
      resources: [{ label: 'Forecasting: Principles and Practice (free book)', url: 'https://otexts.com/fpp3/' }, { label: 'pandas: Time series user guide', url: 'https://pandas.pydata.org/docs/user_guide/timeseries.html' }],
    },
    {
      id: 'adv-big-data',
      title: 'Big Data Fundamentals (Optional Specialization)',
      minutes: 30,
      difficulty: 'intermediate',
      optional: true,
      objectives: [
        'Explain when data becomes “big” (volume, velocity, variety) and why single-machine tools struggle',
        'Describe distributed storage and processing (data lakes, warehouses, Spark)',
        'Use memory-efficient techniques in pandas (chunks, dtypes, columnar formats)',
        'Read basic PySpark DataFrame code',
      ],
      intro: md`
pandas loads data into one computer’s memory. When data reaches hundreds of gigabytes or arrives as a constant stream, you need different tools. You don’t need to be a data engineer, but you should understand the landscape and how to work efficiently before reaching for a cluster.
`,
      simple: md`
If you need to count every word in a library, one person reading every book takes forever. Instead, give each of 100 people a shelf, let them count their shelf, and add up the results. That’s **distributed computing** — the idea behind Hadoop and Spark.

Most “big data” problems, though, can be solved on one laptop with smart techniques: only load the columns you need, use compact data types, process the file in chunks, and store data in efficient formats like Parquet.
`,
      technical: md`
### The 3 Vs (+ more)
**Volume** (TBs–PBs), **velocity** (streams: clicks, sensors), **variety** (structured, logs, images). Often also *veracity* (quality) and *value*.

### Storage
- **Data warehouse** (BigQuery, Snowflake, Redshift): structured, SQL, optimised for analytics.
- **Data lake** (S3, Azure Data Lake, GCS): raw files of any type, cheap; **lakehouse** (Databricks, Delta Lake/Iceberg) adds tables and transactions on top.
- **Columnar formats** (Parquet, ORC): store each column together → compression and reading only needed columns.

### Processing
- **MapReduce / Hadoop:** split → map → shuffle → reduce (historic).
- **Apache Spark:** in-memory distributed processing with a DataFrame API (PySpark) and Spark SQL; lazy evaluation builds a plan executed on a cluster.
- **Streaming:** Kafka, Spark Structured Streaming, Flink.
- **Single-machine alternatives:** DuckDB (fast SQL on local files), Polars (fast DataFrames), Dask (parallel pandas-like).

### Working efficiently in pandas
\`usecols=\`, appropriate \`dtype=\` (e.g. \`category\`, \`int32\`, \`float32\`), \`chunksize=\` for streaming through files, \`df.memory_usage(deep=True)\`, vectorised operations, Parquet instead of CSV.
`,
      terms: [
        ['Distributed computing', 'Splitting work across many machines.'],
        ['Data lake', 'Central storage of raw data files in any format.'],
        ['Data warehouse', 'Structured, query-optimised analytical database.'],
        ['Parquet', 'Compressed columnar file format.'],
        ['Apache Spark', 'Engine for large-scale distributed data processing.'],
        ['Lazy evaluation', 'Building a plan of operations and executing it only when results are needed.'],
        ['Chunking', 'Processing a large file piece by piece.'],
      ],
      realWorld: md`
A streaming service logs 500 million play events per day to a data lake as Parquet files. Data engineers run nightly Spark jobs to aggregate them into warehouse tables (plays per title per country per day). Analysts then query those compact tables in SQL or pandas — they never touch the raw petabytes directly.
`,
      steps: [
        'Measure: how big is the data really, and how much memory do you have?',
        'Reduce: select columns, filter rows early, use efficient dtypes and Parquet.',
        'Stream: process in chunks or push computation into the database (SQL).',
        'Scale out only when needed: DuckDB/Polars locally, then Spark/warehouse.',
        'Aggregate big data into smaller analytical tables for modelling and BI.',
      ],
      code: [
        {
          title: 'Memory-efficient pandas: dtypes and chunked processing',
          code: md`
import pandas as pd

raw = pd.read_csv("data/sales.csv")
print("default memory (KB):", round(raw.memory_usage(deep=True).sum() / 1024, 1))

slim = pd.read_csv("data/sales.csv", usecols=["order_date", "region", "category", "revenue"],
                   dtype={"region": "category", "category": "category", "revenue": "float32"})
print("optimised memory (KB):", round(slim.memory_usage(deep=True).sum() / 1024, 1))

totals = {}
for chunk in pd.read_csv("data/sales.csv", chunksize=300):
    for region, value in chunk.groupby("region")["revenue"].sum().items():
        totals[region] = totals.get(region, 0) + value
print("chunked totals match:", pd.Series(totals).round(2).sort_index().equals(raw.groupby("region")["revenue"].sum().round(2).sort_index()))
`,
          explanation: [
            'Load the full file normally and measure memory, including string contents (`deep=True`).',
            'Re-read only four needed columns, storing repeated labels as `category` (stored once + small integer codes) and revenue as 32-bit floats.',
            'Memory drops substantially — on millions of rows that’s the difference between fitting in RAM or not.',
            'Chunked processing: read 300 rows at a time (imagine a 50 GB file)…',
            '…aggregate each chunk and accumulate running totals — only one chunk is ever in memory.',
            'The chunked result equals the full in-memory groupby.',
          ],
        },
        {
          title: 'The same aggregation in PySpark (read-only: runs on a Spark cluster or Databricks)',
          runnable: false,
          code: md`
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.appName("sales").getOrCreate()
sales = spark.read.parquet("s3://company-lake/sales/")          # billions of rows, many files

summary = (sales
           .filter(F.col("order_date") >= "2025-01-01")
           .groupBy("region", "category")
           .agg(F.sum("revenue").alias("revenue"), F.countDistinct("order_id").alias("orders"))
           .orderBy(F.desc("revenue")))
summary.show(10)                                              # triggers distributed execution
summary.write.mode("overwrite").parquet("s3://company-lake/marts/sales_summary/")
`,
          explanation: [
            'PySpark’s entry point and column functions.',
            'Start (or connect to) a Spark session on a cluster.',
            'Read a directory of Parquet files from a data lake — Spark splits the work across machines.',
            'Build a query plan with a pandas-like API: filter…',
            '…group…',
            '…aggregate (sum and distinct count)…',
            '…and sort. Nothing has run yet (lazy evaluation).',
            '`show()` triggers execution across the cluster and prints the top rows.',
            'Write the small summary table back to the lake for analysts and dashboards.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Reaching for Spark for a 2 GB CSV.', fix: 'Optimise pandas (dtypes, columns) or use DuckDB/Polars first.' },
        { mistake: 'Loading entire tables into pandas to filter them.', fix: 'Filter and aggregate in SQL/warehouse first.' },
        { mistake: 'Storing analytics data as CSV forever.', fix: 'Use Parquet for speed, compression and types.' },
      ],
      exercises: [
        {
          id: 'adv6-ex1', title: 'Chunked total', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Compute \`total\` — the total \`revenue\` in \`data/sales.csv\` — by reading the file with \`chunksize=250\` and summing chunk by chunk.`,
          starter: md`
import pandas as pd
total = 0
print(total)
`,
          solution: md`
import pandas as pd
total = 0
for chunk in pd.read_csv("data/sales.csv", chunksize=250):
    total += chunk["revenue"].sum()
print(round(total, 2))
`,
          tests: md`assert abs(total - pd.read_csv("data/sales.csv")["revenue"].sum()) < 1e-6, f"Got {total}"`,
          hints: ['`for chunk in pd.read_csv(path, chunksize=250):` then add `chunk["revenue"].sum()`.'],
        },
        {
          id: 'adv6-ex2', title: 'Shrink with categories', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Read \`data/churn.csv\` into \`df\` with the text columns \`contract\`, \`internet_service\`, \`tech_support\`, \`paperless_billing\` and \`churn\` stored as \`category\`. Its deep memory usage must be lower than the default read.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
`,
          solution: md`
import pandas as pd
cats = ["contract", "internet_service", "tech_support", "paperless_billing", "churn"]
df = pd.read_csv("data/churn.csv", dtype={c: "category" for c in cats})
print(df.dtypes)
`,
          tests: md`
for c in ["contract", "internet_service", "tech_support", "paperless_billing", "churn"]:
    assert str(df[c].dtype) == "category", f"{c} should be category"
assert df.memory_usage(deep=True).sum() < pd.read_csv("data/churn.csv").memory_usage(deep=True).sum()
`,
          hints: ['`dtype={"contract": "category", ...}` in read_csv.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which format stores data by column and compresses well?', options: ['CSV', 'Parquet', 'TXT', 'JSON'], answer: 1, explanation: 'Parquet is columnar.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Spark’s lazy evaluation means…', options: ['It runs slowly', 'Transformations build a plan that runs only when an action (show, write) is called', 'It never runs', 'It skips errors'], answer: 1, explanation: 'Plans are optimised before execution.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A 3 GB CSV on a 16 GB laptop is best handled first with…', options: ['A 100-node cluster', 'Efficient pandas/DuckDB/Polars techniques', 'Excel', 'Deleting data'], answer: 1, explanation: 'Scale out only when needed.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: '“Velocity” in big data refers to…', options: ['Data size', 'Speed at which data arrives', 'Data types', 'Data quality'], answer: 1, explanation: 'Streams of events.' },
      ],
      summary: [
        'Big data = volume, velocity, variety beyond one machine’s comfort.',
        'Warehouses, lakes/lakehouses and columnar formats; Spark for distributed processing.',
        'Optimise locally first: columns, dtypes, chunks, Parquet, DuckDB/Polars.',
        'Aggregate big data into analytical tables for modelling and BI.',
      ],
      resources: [{ label: 'Apache Spark — Quick start', url: 'https://spark.apache.org/docs/latest/quick-start.html' }, { label: 'DuckDB', url: 'https://duckdb.org/' }],
    },
    {
      id: 'adv-genai-llms',
      title: 'Generative AI & Large Language Models (Essential)',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Explain how LLMs work at a high level: tokens, next-token prediction, transformers, pre-training and fine-tuning',
        'Use LLMs responsibly in data work (coding help, summarisation, extraction) and know their limits',
        'Explain retrieval-augmented generation (RAG) and embeddings',
        'Call an LLM API securely and evaluate outputs',
      ],
      intro: md`
Generative AI has changed how data scientists work: assistants write and explain code, LLMs extract structure from messy text, and embeddings power semantic search. Every data professional needs to understand what these models are, how to use them productively, and how they fail. (The AI Tutor in this app is an LLM!)
`,
      simple: md`
A large language model has read an enormous amount of text and learned to **predict the next word** (more precisely, the next *token*). By repeating that prediction over and over, it writes sentences, code or answers.

Because it predicts what *sounds* plausible, it can be confidently **wrong** (“hallucinate”). Treat it like a very fast, knowledgeable intern: great for drafts, explanations and boilerplate code — but you must check its work, especially numbers and facts. Never paste confidential data into tools that aren’t approved by your organisation.
`,
      technical: md`
### How LLMs work
1. **Tokenisation:** text → tokens (sub-word pieces) → integer IDs → embedding vectors.
2. **Transformer** layers use **self-attention**, letting each token weigh information from all previous tokens.
3. **Pre-training:** predict the next token on huge text corpora (self-supervised).
4. **Post-training:** instruction tuning and reinforcement learning from human (or AI) feedback make the model helpful and safer.
5. **Generation:** repeatedly sample the next token; settings like temperature control randomness.

The **context window** limits how much text the model considers at once.

### Using LLMs in data work
- Explaining/writing code, SQL and regex; reviewing and debugging.
- **Extraction & classification** of unstructured text (support tickets → category, sentiment, product).
- Summarising documents and survey responses.
- Generating synthetic test data or documentation.

### Retrieval-augmented generation (RAG)
**Embeddings** map text to vectors where similar meanings are close (cosine similarity, Module 3!). RAG: embed your documents → store vectors → retrieve the most similar passages for a question → give them to the LLM as context → answer grounded in your data (with citations).

### Limits and risks
Hallucinations, outdated knowledge, sensitivity to prompt wording, bias, privacy/IP issues, prompt injection (malicious instructions hidden in input text), cost and latency. **Evaluate** outputs on a labelled sample like any model (accuracy, precision/recall for extraction); keep humans in the loop for consequential decisions.

### Calling an API securely
Keep API keys in **environment variables on a server**, never in front-end code or notebooks you share. Validate and post-process outputs (e.g. require JSON with a schema).
`,
      terms: [
        ['LLM', 'Large language model trained to predict the next token on vast text corpora.'],
        ['Token', 'A chunk of text (often part of a word) processed by the model.'],
        ['Transformer', 'Neural architecture based on self-attention.'],
        ['Context window', 'Maximum amount of text the model can consider at once.'],
        ['Hallucination', 'A fluent but false or unsupported output.'],
        ['Embedding', 'A vector representing the meaning of text.'],
        ['RAG', 'Retrieval-augmented generation: grounding answers in retrieved documents.'],
        ['Prompt injection', 'Malicious instructions hidden in inputs that try to hijack the model.'],
      ],
      realWorld: md`
A customer-support team receives 5,000 free-text tickets a week. An LLM extracts \`product\`, \`issue_type\` and \`urgency\` as JSON from each ticket; analysts validated it on 300 hand-labelled tickets (93% agreement) before rolling it out. The structured output feeds a dashboard showing which product issues are rising — analysis that previously required reading tickets by hand.
`,
      steps: [
        'Define the task precisely (inputs, desired output format, quality bar).',
        'Write clear instructions and give examples; request structured output.',
        'Run on a labelled sample and measure quality like any model.',
        'Add guardrails: validation, human review for edge cases, no sensitive data in unapproved tools.',
        'Monitor cost, latency and quality over time.',
      ],
      code: [
        {
          title: 'Embeddings-style retrieval: find the most relevant document (runnable)',
          code: md`
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

docs = {
    "refund-policy": "Customers can request a refund within 30 days of delivery if the item is unused.",
    "shipping": "Standard shipping takes 3-5 business days; express shipping takes 1-2 days.",
    "warranty": "Electronics include a one-year warranty covering manufacturing defects.",
    "accounts": "You can reset your password from the login page using your registered email.",
}
question = "How many days do I have to return an item for my money back?"

vec = TfidfVectorizer(stop_words="english").fit(list(docs.values()) + [question])
D = vec.transform(docs.values()).toarray()
q = vec.transform([question]).toarray()[0]
sims = D @ q / (np.linalg.norm(D, axis=1) * np.linalg.norm(q) + 1e-12)
for name, s in sorted(zip(docs, sims), key=lambda t: -t[1]):
    print(f"{name:14s} similarity={s:.3f}")
best = list(docs)[int(sims.argmax())]
prompt = f"Answer using only this context.\nContext: {docs[best]}\nQuestion: {question}"
print("\nPrompt sent to the LLM (RAG):\n", prompt)
`,
          explanation: [
            'A tiny knowledge base of help-centre articles.',
            '…',
            '…',
            '…',
            '…',
            'A user question with different wording than the documents.',
            'Real RAG systems use neural **embeddings**; here TF-IDF vectors play that role so the example runs in the browser.',
            'Vectorise documents and the question.',
            '…',
            '**Cosine similarity** between the question and each document (Module 3) — the retrieval step.',
            'Rank documents by similarity: the refund policy ranks first.',
            'Pick the best match…',
            '…and build the grounded prompt: the LLM is asked to answer **only** from the retrieved context, reducing hallucinations.',
          ],
        },
        {
          title: 'Calling Claude from Python to extract structured data (read-only: needs an API key)',
          runnable: false,
          code: md`
import json
import os
import anthropic

client = anthropic.Anthropic()   # reads ANTHROPIC_API_KEY from the environment — never hard-code keys

ticket = "My new X200 headphones stopped charging after two days. I need them for a flight tomorrow!"
response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1000,
    system="Extract fields from customer support tickets. Reply with JSON only.",
    messages=[{"role": "user", "content": f"Ticket: {ticket}\n"
               'Return {"product": str, "issue_type": "defect|shipping|billing|other", "urgency": "low|medium|high"}'}],
)
text = next(b.text for b in response.content if b.type == "text")
data = json.loads(text)
assert data["issue_type"] in {"defect", "shipping", "billing", "other"}
print(data)
`,
          explanation: [
            'Imports: JSON parsing, environment access and the official Anthropic Python SDK.',
            'The client reads the API key from the `ANTHROPIC_API_KEY` environment variable — keys never belong in code or shared notebooks.',
            'An unstructured support ticket.',
            '`messages.create` sends the request to the model…',
            '…choosing a model…',
            '…limiting the response length…',
            '…a system instruction defining the task and output format…',
            '…and the user message with the ticket plus the exact JSON schema expected.',
            'Take the text block from the response.',
            'Parse it as JSON…',
            '…and **validate** it before trusting it in a pipeline (in production, also handle parse errors and log failures).',
            'Structured fields ready for a dashboard.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Trusting LLM-generated numbers, citations or code without checking.', fix: 'Verify facts, run the code, and test outputs on labelled samples.' },
        { mistake: 'Pasting confidential or personal data into public chatbots.', fix: 'Use approved tools and anonymise data.' },
        { mistake: 'Putting API keys in front-end code or notebooks.', fix: 'Store keys in server-side environment variables (as this app does).' },
        { mistake: 'Feeding untrusted text straight into prompts that control actions.', fix: 'Treat inputs as data, validate outputs, and limit what the model can trigger (prompt-injection defence).' },
      ],
      exercises: [
        {
          id: 'adv7-ex1', title: 'Cosine similarity retrieval', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`top_match(doc_vectors, query_vector)\` that returns the **index** of the row in \`doc_vectors\` (2-D NumPy array) with the highest cosine similarity to \`query_vector\`.`,
          starter: md`
import numpy as np

def top_match(doc_vectors, query_vector):
    return 0

D = np.array([[1.0, 0, 0], [0.7, 0.7, 0], [0, 0, 1.0]])
print(top_match(D, np.array([0.1, 0.0, 0.9])))
`,
          solution: md`
import numpy as np

def top_match(doc_vectors, query_vector):
    sims = doc_vectors @ query_vector / (np.linalg.norm(doc_vectors, axis=1) * np.linalg.norm(query_vector))
    return int(np.argmax(sims))

D = np.array([[1.0, 0, 0], [0.7, 0.7, 0], [0, 0, 1.0]])
print(top_match(D, np.array([0.1, 0.0, 0.9])))
`,
          tests: md`
assert top_match(D, np.array([0.1, 0.0, 0.9])) == 2
assert top_match(D, np.array([1.0, 1.1, 0.0])) == 1
assert top_match(D, np.array([5.0, 0.2, 0.1])) == 0, "Cosine similarity ignores vector length"
`,
          hints: ['cos = (D @ q) / (‖Dᵢ‖ · ‖q‖) for each row.', '`np.argmax` returns the best index.'],
        },
        {
          id: 'adv7-ex2', title: 'Validate model output', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`
Write \`parse_ticket(text)\` that parses an LLM’s JSON reply and returns the dict, but raises \`ValueError\` if the JSON is invalid or \`urgency\` is not one of \`"low"\`, \`"medium"\`, \`"high"\`.
`,
          starter: md`
import json

def parse_ticket(text):
    return json.loads(text)

print(parse_ticket('{"product": "X200", "urgency": "high"}'))
`,
          solution: md`
import json

def parse_ticket(text):
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"invalid JSON: {e}") from e
    if data.get("urgency") not in {"low", "medium", "high"}:
        raise ValueError("urgency must be low, medium or high")
    return data

print(parse_ticket('{"product": "X200", "urgency": "high"}'))
`,
          tests: md`
assert parse_ticket('{"product": "X200", "urgency": "high"}')["product"] == "X200"
for bad in ['{"urgency": "urgent!!"}', "Sure! Here is the JSON: {...}", '{"product": "A"}']:
    try:
        parse_ticket(bad)
    except ValueError:
        pass
    else:
        raise AssertionError(f"Should reject {bad!r}")
`,
          hints: ['`json.JSONDecodeError` is raised for invalid JSON — convert it to ValueError.', 'Check `data.get("urgency")` against the allowed set.'],
        },
        {
          id: 'adv7-ex3', title: 'What is a hallucination?', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`An LLM cites a research paper that doesn’t exist, in a confident tone. What is this failure called? (one word)`,
          solution: 'hallucination', accepted: ['hallucination', 'hallucinating', 'hallucinations'],
          hints: ['Fluent but false output.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'During pre-training, an LLM learns mainly to…', options: ['Classify images', 'Predict the next token', 'Cluster documents', 'Run SQL'], answer: 1, explanation: 'Self-supervised next-token prediction.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'RAG reduces hallucinations by…', options: ['Training a bigger model', 'Retrieving relevant documents and asking the model to answer from them', 'Lowering cost', 'Removing the context window'], answer: 1, explanation: 'Grounding in retrieved context.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Where should an LLM API key live in a web app?', options: ['In the JavaScript bundle', 'In server-side environment variables', 'In the URL', 'In a public GitHub repo'], answer: 1, explanation: 'Never expose secrets to the browser.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Before using LLM extraction in production you should…', options: ['Trust it — it’s AI', 'Evaluate it on a labelled sample and add validation', 'Increase temperature', 'Remove all instructions'], answer: 1, explanation: 'Treat it like any model: measure quality.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Prompt injection is…', options: ['A way to speed up models', 'Malicious instructions embedded in input text that try to override the system’s instructions', 'A tokenisation method', 'A fine-tuning technique'], answer: 1, explanation: 'Treat external text as untrusted data.' },
      ],
      summary: [
        'LLMs: tokens → transformer → next-token prediction; pre-training + post-training.',
        'Useful for code help, extraction, summarisation; they can hallucinate.',
        'Embeddings + retrieval (RAG) ground answers in your documents.',
        'Secure keys server-side, validate outputs, evaluate on labelled data, protect privacy.',
      ],
      resources: [{ label: 'Anthropic — Prompt engineering overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' }, { label: '3Blue1Brown — Transformers explained', url: 'https://www.3blue1brown.com/lessons/gpt' }],
    },
  ],
};
