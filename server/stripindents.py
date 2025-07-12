"""
Utility to remove leading/trailing new‑lines and trim each line,
mimicking the behaviour of the TypeScript `stripIndents` helper.
"""

from typing import Any, Iterable, Union

def strip_indents(value: Union[str, Iterable[str]], *values: Any) -> str:
    """
    Parameters
    ----------
    value : str | Iterable[str]
        Either a single string OR an iterable of string fragments
        (mimicking a JS template literal's raw strings).
    *values : Any
        Values interpolated between template fragments
        (again, modelling JS template literals).

    Returns
    -------
    str
        The fully‑processed, de‑indented string.
    """
    if not isinstance(value, str):
        # Treat `value` like TemplateStringsArray in TS:  list/tuple of literal segments
        processed = ""
        for i, fragment in enumerate(value):
            processed += fragment
            if i < len(values):
                processed += str(values[i])
        value = processed

    # Remove leading/trailing whitespace on each line, collapse back to \n
    cleaned = "\n".join(line.strip() for line in value.splitlines())
    # Trim leading whitespace/newlines, then drop a single trailing newline if present
    return cleaned.lstrip().rstrip("\r\n")


# Convenience alias to more closely match TS naming
stripIndents = strip_indents
