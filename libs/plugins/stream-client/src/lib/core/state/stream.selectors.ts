import { createFeatureSelector } from '@ngrx/store';
import { FlogoStreamState } from './stream.state';

export const selectStreamState = createFeatureSelector<FlogoStreamState>('stream');
