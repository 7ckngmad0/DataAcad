import type { Module } from '../types.ts';
import { m10a } from './m10a.ts';
import { m10b } from './m10b.ts';

export const m10: Module = {
  id: 'ml',
  number: 10,
  title: 'Machine Learning',
  short: 'Machine Learning',
  icon: 'brain',
  description:
    'Machine learning from the ground up with scikit-learn: the supervised workflow, linear and logistic regression, trees and random forests, k-NN and SVMs, clustering, PCA, evaluation metrics, cross-validation and hyperparameter tuning.',
  skills: ['ML workflow', 'Regression', 'Classification', 'Trees & forests', 'k-NN & SVM', 'Clustering', 'PCA', 'Evaluation metrics', 'Cross-validation & tuning'],
  lessons: [...m10a, ...m10b],
};
