from api.course_loader.models import (
    Course, CourseMeta, EstimatedHours, Module, Submodule,
    StubRef, TestSpec, Resource,
)


def test_course_construction():
    course = Course(
        meta=CourseMeta(
            slug="hello-world",
            title="Hola Mundo",
            description="Test course",
            language="go",
            difficulty="beginner",
            runner="buildmancer/runner-go:latest",
            estimated_hours=EstimatedHours(junior=1, mid=1, senior=1),
        ),
        modules=[
            Module(
                id="basics",
                title="Basics",
                description="Learn basics.",
                submodules=[
                    Submodule(
                        id="hello",
                        full_id="basics/hello",
                        title="Hello",
                        spec="Implement Hello()",
                        stubs=[StubRef(path="main.go")],
                        tests=[TestSpec(type="unit", match="TestHello", timeout_ms=5000)],
                        resources=[
                            Resource(
                                title="Docs",
                                file="basics/hello_doc.md",
                                type="doc",
                                visible_to=["junior", "mid", "senior"],
                            )
                        ],
                    )
                ],
            )
        ],
    )
    assert course.meta.slug == "hello-world"
    assert course.modules[0].submodules[0].full_id == "basics/hello"
    assert course.modules[0].submodules[0].tests[0].type == "unit"


def test_test_spec_defaults():
    spec = TestSpec(type="unit", match="TestFoo")
    assert spec.timeout_ms == 5000
    assert spec.stdin is None
    assert spec.manages_lifecycle is False


def test_test_spec_http():
    spec = TestSpec(
        type="http",
        timeout_ms=3000,
        request={"method": "GET", "path": "/health"},
        expected={"status": 200, "body_contains": "ok"},
    )
    assert spec.request["method"] == "GET"
    assert spec.expected["status"] == 200
