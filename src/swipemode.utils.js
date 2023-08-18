function getRangeEvent(rangeInput) {
  return 'oninput' in rangeInput ? 'input' : 'change';
}

export { getRangeEvent };
