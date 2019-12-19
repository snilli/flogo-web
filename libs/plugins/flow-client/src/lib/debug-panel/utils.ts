import { FormGroup } from '@angular/forms';
import { Dictionary, StepAttribute } from '@flogo-web/lib-client/core';

export function mergeFormWithOutputs(
  form: FormGroup,
  lastExecutionResult: Dictionary<StepAttribute>
) {
  const outputFields = form && form.get('output.formFields');
  if (outputFields && lastExecutionResult) {
    const outputs = matchFormWithExecutionResult(lastExecutionResult, outputFields.value);
    outputFields.patchValue(outputs);
  }
  return form;
}

export function matchFormWithExecutionResult(step: StepAttribute, formValues: any[]) {
  const outputs = new Map(
    Object.keys(step).map<[string, string]>(attr => {
      const [taskType, taskId, attribute] = attr.split('.');
      return [attribute, step[attr]];
    })
  );
  const newOutput = formValues.map(field => {
    const value = outputs.has(field.name) ? outputs.get(field.name) : null;
    return { ...field, value };
  });
  outputs.clear();
  return newOutput;
}
