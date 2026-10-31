import type { ComponentType } from 'react';
import type { WidgetId } from '../../types';
import { DataTypeSorter, Lifecycle } from './intro';
import { Derivative, FunctionGrapher, GradientDescent, MatrixMultiply, Vectors } from './math';
import { Bayes, CLT, ConfidenceIntervals, Correlation, DescriptiveStats, Distributions, ProbabilitySim } from './stats';
import { ChartGallery, MisleadingCharts } from './viz';
import { ConfusionMatrix, KMeans, Neuron, Overfitting, Regression } from './ml';
import { SqlSchemaWidget } from './SqlSchema';

export const WIDGETS: Record<WidgetId, ComponentType> = {
  lifecycle: Lifecycle,
  'data-type-sorter': DataTypeSorter,
  'function-grapher': FunctionGrapher,
  derivative: Derivative,
  vectors: Vectors,
  'matrix-multiply': MatrixMultiply,
  'gradient-descent': GradientDescent,
  'descriptive-stats': DescriptiveStats,
  'probability-sim': ProbabilitySim,
  bayes: Bayes,
  distributions: Distributions,
  clt: CLT,
  'confidence-intervals': ConfidenceIntervals,
  correlation: Correlation,
  'misleading-charts': MisleadingCharts,
  'chart-gallery': ChartGallery,
  regression: Regression,
  kmeans: KMeans,
  'confusion-matrix': ConfusionMatrix,
  overfitting: Overfitting,
  neuron: Neuron,
  'sql-schema': SqlSchemaWidget,
};
