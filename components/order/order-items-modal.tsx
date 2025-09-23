import { addConfiguredToCart } from "@/lib/actions/configured-actions";
import ModalSubmit from "./modal-submit";
import AddToOrderButton from "./add-to-order-btn";

export type SizeOpt = { id: string; label: string; deltaCents?: number; required?: true };
export type AddOnOpt = { id: string; label: string; deltaCents?: number };

export default function ItemOptionsModal({
  modalId,
  itemId,
  itemName,
  itemDescription,
  basePriceCents,
  sizes,
  addons = [],
}: {
  modalId: string;
  itemId: string;
  itemName: string;
  itemDescription?: string;
  basePriceCents: number;
  sizes: SizeOpt[];
  addons?: AddOnOpt[];
}) {
  return (
    <>
      {/* DaisyUI modal (checkbox) */}
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box max-w-2xl rounded-2xl border border-neutral-200 p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="font-semibold">{itemName}</h3>
            {itemDescription && <p className="text-sm opacity-70">{itemDescription}</p>}
          </div>

          {/* Body */}
          <form action={addConfiguredToCart} className="px-6 py-5 space-y-6">
            <input name="menuItemId" type="hidden" value={itemId} />

            {/* Sizes (required) */}
            <fieldset className="space-y-2">
              <div className="flex items-center justify-between">
                <legend className="text-sm font-medium">Choose a Size</legend>
                <span className="badge badge-ghost badge-sm">REQUIRED</span>
              </div>
              <div className="space-y-2">
                {sizes.map((s, i) => (
                  <label
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        value={s.label}
                        defaultChecked={i === 0}
                        className="radio radio-sm"
                        required
                      />
                      <span>{s.label}</span>
                    </div>
                    <span className="text-sm">
                      {s.deltaCents
                        ? `+$${(s.deltaCents / 100).toFixed(2)}`
                        : `$${(basePriceCents / 100).toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
              {/* Submit all size deltas so server can resolve chosen label w/o JS */}
              {sizes.map((s) => (
                <input key={s.id} type="hidden" name={`size:${s.label}`} value={s.deltaCents ?? 0} />
              ))}
            </fieldset>

           {/* Add-ons (optional) */}
{addons.length > 0 && (
  <fieldset className="space-y-2">
    <div className="flex items-center justify-between">
      <legend className="text-sm font-medium">Add Ons</legend>
      <span className="badge badge-ghost badge-sm">OPTIONAL</span>
    </div>
    <div className="space-y-2">
      {addons.map((a) => (
        <label
          key={a.id}
          className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {/* IMPORTANT: checkbox value is the stable ID */}
            <input
              type="checkbox"
              name="addons"
              value={a.id}
              className="checkbox checkbox-sm"
            />
            <span>{a.label}</span>
          </div>

          <span className="text-sm">
            +${((a.deltaCents ?? 0) / 100).toFixed(2)}
          </span>

          {/* Hidden fields keyed by ID so the action can total ONLY selected ones */}
          <input type="hidden" name={`addon:${a.id}`} value={a.deltaCents ?? 0} />
          <input type="hidden" name={`label:addon:${a.id}`} value={a.label} />
        </label>
      ))}
    </div>
  </fieldset>
)}


            {/* Special Instructions (column layout) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Special Instructions</label>
                <span className="text-xs opacity-60">Max 200 characters</span>
              </div>
              <textarea
                name="notes"
                maxLength={200}
                className="textarea textarea-bordered w-full min-h-[88px] rounded-xl border-neutral-200"
                placeholder="e.g., Light sauce, extra crispy…"
              />
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 left-0 right-0 bg-base-100 border-t border-neutral-200 -mx-6">
              <div className="px-6 py-4 flex items-center justify-between gap-4">
                {/* Qty pill (match CTA height) */}
                <div className="join border border-neutral-200 rounded-full overflow-hidden h-11">
                  <button type="button" className="join-item btn btn-ghost h-11 min-h-0 rounded-full px-3" aria-hidden>
                    −
                  </button>
                  <input
                    type="number"
                    name="qty"
                    min={1}
                    defaultValue={1}
                    className="join-item input input-bordered h-11 w-16 text-center border-0 focus:outline-none"
                    aria-label="Quantity"
                  />
                  <button type="button" className="join-item btn btn-ghost h-11 min-h-0 rounded-full px-3" aria-hidden>
                    +
                  </button>
                </div>

                {/* Hidden: server computes chosen size delta by matching label */}
                <input type="hidden" name="sizeDeltaCents" value={0} />

                {/* Submit that also closes the modal immediately */}

                {/* dynamic Total | base price + add ons */}

               




                <ModalSubmit
                  modalId={modalId}
                  className="btn btn-neutral h-11 min-h-0 rounded-full px-6 min-w-[12rem] justify-between"
                >
                  <span>Add to Order</span>
                  <span className="opacity-90">{`$${(basePriceCents / 100).toFixed(2)}`}</span>
                  {/* <AddToOrderButton
                  basePriceCents={a.unitPriceCents}
                  addonIds={a.metadata}
                  /> */}
                  
                </ModalSubmit>
              </div>
            </div>
          </form>

          {/* Footer cancel */}
          <div className="px-6 py-4">
            <label htmlFor={modalId} className="btn btn-ghost w-full rounded-full border border-neutral-200">
              Cancel
            </label>
          </div>

          {/* Close (X) */}
          <label htmlFor={modalId} className="btn btn-ghost btn-sm absolute right-3 top-3" aria-label="Close">
            ✕
          </label>
        </div>
      </div>
    </>
  );
}
