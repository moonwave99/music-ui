import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TempoControl } from "./TempoControl";

describe("TempoControl", () => {
  it("renders correctly", () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <TempoControl id="1" value={60} onChange={onChange} onReset={onReset} />,
    );
    expect(screen.getByLabelText("Tempo")).toBeVisible();
    expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("60");
  });

  it("calls onChange when the value changes", () => {
    const onChange = vi.fn();
    const { container } = render(
      <TempoControl id="1" value={60} onChange={onChange} onReset={vi.fn()} />,
    );
    fireEvent.change(container.querySelector("input")!, {
      target: { value: 99 },
    });
    expect(onChange).toHaveBeenCalledWith(99);
  });

  it("calls onReset when the value changes", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <TempoControl id="1" value={60} onChange={vi.fn()} onReset={onReset} />,
    );
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
