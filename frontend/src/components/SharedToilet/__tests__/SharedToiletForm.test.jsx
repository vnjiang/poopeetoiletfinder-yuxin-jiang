import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedToiletForm from "../SharedToiletForm";

const EMPTY = {
    toilet_name: "",
    toilet_description: "",
    eircode: "",
    contact_number: "",
    type: "free",
    price: "",
};

function lastValueForKey(mockFn, key) {
    const calls = mockFn.mock.calls.filter((c) => c[0] === key);
    return calls.length ? calls[calls.length - 1][1] : undefined;
}

describe("SharedToiletForm", () => {
    test("Create mode: title is 'Share a Toilet' and there is no Cancel button", () => {
        render(
            <SharedToiletForm
                value={EMPTY}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                isEditing={false}
                loading={false}
            />
        );

        expect(screen.getByText("Share a Toilet")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    });

    test("Edit mode: shows the banner + Cancel; clicking Cancel calls onCancel and does not call onChange", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const onCancel = jest.fn();

        render(
            <SharedToiletForm
                value={{ ...EMPTY, toilet_name: "X", type: "paid", price: "€1",approved_by_admin: true }}
                onChange={onChange}
                onSubmit={jest.fn()}
                onCancel={onCancel}   
                isEditing={true}
                loading={false}
            />
        );

        expect(screen.getByText("Edit Toilet")).toBeInTheDocument();
        expect(screen.getByText(/You are editing an existing toilet/i)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();
    });

    test("Typing triggers onChange(key, value) (use a wrapper for controlled inputs)", async () => {
        const user = userEvent.setup();
        const onChangeSpy = jest.fn();

        function Wrapper() {
            const [val, setVal] = React.useState(EMPTY);

            const handleChange = (key, nextValue) => {
                setVal((prev) => ({ ...prev, [key]: nextValue }));
                onChangeSpy(key, nextValue);
            };

            return (
                <SharedToiletForm
                    value={val}
                    onChange={handleChange}
                    onSubmit={jest.fn()}
                    isEditing={false}
                    loading={false}
                />
            );
        }

        render(<Wrapper />);

        await user.type(screen.getByPlaceholderText("Toilet name"), "My Toilet");
        expect(lastValueForKey(onChangeSpy, "toilet_name")).toBe("My Toilet");

        await user.type(screen.getByPlaceholderText("Description"), "Nice place");
        expect(lastValueForKey(onChangeSpy, "toilet_description")).toBe("Nice place");

        await user.type(screen.getByPlaceholderText("Eircode"), "D01XXXX");
        expect(lastValueForKey(onChangeSpy, "eircode")).toBe("D01XXXX");

        await user.type(screen.getByPlaceholderText("Contact number"), "0890000000");
        expect(lastValueForKey(onChangeSpy, "contact_number")).toBe("0890000000");
    });


    test("When type=paid, the price dropdown is shown; selecting a price triggers onChange('price', ...)", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <SharedToiletForm
                value={{ ...EMPTY, type: "paid" }}
                onChange={onChange}
                onSubmit={jest.fn()}
                isEditing={false}
                loading={false}
            />
        );


        const selects = screen.getAllByRole("combobox");
        expect(selects.length).toBeGreaterThanOrEqual(2);

        await user.selectOptions(selects[1], "€0.5");
        expect(onChange).toHaveBeenCalledWith("price", "€0.5");
    });

    test("Submit: clicking Submit/Update triggers onSubmit", async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn((e) => e.preventDefault());

        render(
            <SharedToiletForm
                value={EMPTY}
                onChange={jest.fn()}
                onSubmit={onSubmit}
                isEditing={false}
                loading={false}
            />
        );

        await user.click(screen.getByRole("button", { name: "Submit" }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test("When loading=true, the button is disabled and the label becomes 'Submitting...'", () => {
        render(
            <SharedToiletForm
                value={EMPTY}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                isEditing={false}
                loading={true}
            />
        );

        const btn = screen.getByRole("button", { name: "Submitting..." });
        expect(btn).toBeDisabled();
    });
});
