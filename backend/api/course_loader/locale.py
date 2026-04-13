# backend/api/course_loader/locale.py
from __future__ import annotations
import copy


def merge_locale_overlay(base: dict, overlay: dict) -> dict:
    result = copy.deepcopy(base)
    if "meta" in overlay:
        _merge_text_fields(result["meta"], overlay["meta"], ["title", "description"])
    if "modules" in overlay:
        overlay_modules = {m["id"]: m for m in overlay["modules"]}
        for base_mod in result.get("modules", []):
            ov_mod = overlay_modules.get(base_mod["id"])
            if not ov_mod:
                continue
            _merge_text_fields(base_mod, ov_mod, ["title", "description"])
            if "submodules" in ov_mod:
                ov_subs = {s["id"]: s for s in ov_mod["submodules"]}
                for base_sub in base_mod.get("submodules", []):
                    ov_sub = ov_subs.get(base_sub["id"])
                    if not ov_sub:
                        continue
                    _merge_text_fields(base_sub, ov_sub, ["title", "spec"])
                    if "resources" in ov_sub:
                        _merge_resource_titles(base_sub, ov_sub)
    return result


def _merge_text_fields(target: dict, source: dict, fields: list[str]) -> None:
    for field in fields:
        if field in source:
            target[field] = source[field]


def _merge_resource_titles(base_sub: dict, ov_sub: dict) -> None:
    base_resources = base_sub.get("resources", [])
    ov_resources = ov_sub.get("resources", [])
    for i, ov_res in enumerate(ov_resources):
        if i < len(base_resources) and "title" in ov_res:
            base_resources[i]["title"] = ov_res["title"]
